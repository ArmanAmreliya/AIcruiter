import { prisma } from '@aicruiter/db';
import Groq from 'groq-sdk';
import { sendEmail } from './mail';

let groq: Groq | null = null;
function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.NEXT_REPORT_API_KEY || process.env.NEXT_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY or NEXT_REPORT_API_KEY is not configured on the server environment. Please configure it in your env variables.");
    }
    groq = new Groq({ apiKey });
  }
  return groq;
}

export async function generateCandidateReport(candidateId: string) {
  try {
    console.log(`[Worker] Generating AI report for candidate ${candidateId}...`);

    // 1. Fetch Candidate & Transcripts & Job
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        job: true,
        transcripts: true
      }
    });

    if (!candidate) {
      console.error(`[Worker] Candidate ${candidateId} not found.`);
      return;
    }

    if (!candidate.transcripts || candidate.transcripts.length === 0) {
      console.warn(`[Worker] No transcripts found for candidate ${candidateId}. Saving default score.`);
      
      const currentMeta = typeof candidate.metaData === 'object' && candidate.metaData ? candidate.metaData : {};
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          status: 'COMPLETED',
          metaData: {
            ...currentMeta,
            overallScore: 60,
            feedback: "No interview transcripts captured to analyze."
          }
        }
      });

      await prisma.activity.create({
        data: {
          userId: candidate.job.userId,
          action: 'CANDIDATE_COMPLETED',
          details: `${candidate.name} finished the interview with a default score of 60% (no dialogue)`
        }
      });
      return;
    }

    // 2. Format the transcripts for Groq
    const dialog = candidate.transcripts
      .map(t => `Sarah: ${t.aiText}\nCandidate: ${t.userText}`)
      .join('\n\n');

    // 3. Request LLM evaluation from Groq
    const systemPrompt = `You are an expert talent screener evaluating a candidate's live interview transcripts.
Evaluate the candidate for the role: ${candidate.job?.title || 'Job Position'}
Job Description: ${candidate.job?.description || 'N/A'}

Provide a JSON object containing:
1. "overallScore" (number between 0 and 100 representing how well the candidate matched the job description).
2. "feedback" (string containing 2-3 sentences of constructive evaluation).
Return ONLY the JSON. No conversational wrappers.`;

    // 3. Request LLM evaluation from Groq with Try-Catch Block
    let reportData = { overallScore: 0, feedback: "" };
    let generationFailed = false;
    let errorMessage = "";

    try {
      const response = await getGroqClient().chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the interview transcript for candidate ${candidate.name}:\n\n${dialog}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const completionText = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(completionText);
        reportData.overallScore = parsed.overallScore || 70;
        reportData.feedback = parsed.feedback || "Good technical skills demonstrated.";
      } catch (e) {
        console.error("[Worker] Failed to parse JSON response from Groq:", completionText);
        generationFailed = true;
        errorMessage = "Error parsing AI response format.";
      }
    } catch (err: any) {
      console.error("[Worker] Groq API call failed:", err);
      generationFailed = true;
      errorMessage = err?.message || "AI evaluation service request failed.";
    }

    if (generationFailed) {
      reportData = {
        overallScore: 0,
        feedback: `Report Generation Failed: ${errorMessage} The evaluation service might be experiencing temporary downtime or rate-limits. Please contact your system administrator.`
      };
    }

    // 4. Update Candidate metadata in DB
    const currentMeta = typeof candidate.metaData === 'object' && candidate.metaData ? candidate.metaData : {};
    const updatedMeta = {
      ...currentMeta,
      overallScore: reportData.overallScore,
      feedback: reportData.feedback,
      completed_at: new Date().toISOString()
    };

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: 'COMPLETED',
        metaData: updatedMeta
      }
    });

    // 5. Add an activity log
    await prisma.activity.create({
      data: {
        userId: candidate.job.userId,
        action: 'CANDIDATE_COMPLETED',
        details: generationFailed
          ? `${candidate.name} finished the interview, but AI report generation failed: ${errorMessage}`
          : `${candidate.name} finished the interview with a match score of ${updatedMeta.overallScore}%`
      }
    });

    // Send evaluation report completed email to recruiter
    try {
      const updatedCandidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          job: {
            include: {
              user: true
            }
          }
        }
      });

      if (updatedCandidate && updatedCandidate.job && updatedCandidate.job.user) {
        const recruiter = updatedCandidate.job.user;
        let settings = { email_interview_complete: true };
        if (recruiter.notificationSettings) {
          try {
            settings = JSON.parse(recruiter.notificationSettings);
          } catch (e) {}
        }

        if (settings.email_interview_complete !== false) {
          const score = updatedMeta.overallScore;
          const feedbackText = updatedMeta.feedback;
          
          await sendEmail({
            to: recruiter.email,
            subject: generationFailed
              ? `Interview Completed (Evaluation Failed): ${candidate.name}`
              : `Interview Completed & Evaluated: ${candidate.name} - ${score}% Match`,
            htmlContent: generationFailed
              ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #333; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
                  <h2 style="color: #ef4444; margin-top: 0;">AI Evaluation Failed</h2>
                  <p>Hello <strong>${recruiter.fullName || 'Recruiter'}</strong>,</p>
                  <p>The candidate <strong>${candidate.name}</strong> has completed their interview session for: <strong>${updatedCandidate.job.title}</strong>, but the automatic AI report generation failed.</p>
                  <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #b91c1c;"><strong>Error Details:</strong> ${errorMessage}</p>
                  </div>
                  <p>You can review candidate session transcripts directly on your <a href="http://localhost:3000/dashboard/candidates" style="color: #7c3aed; font-weight: bold; text-decoration: none;">AIcruiter Dashboard</a>.</p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email was sent automatically by AIcruiter. You can manage alert preferences in settings.</p>
                </div>
              `
              : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #333; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
                  <h2 style="color: #7c3aed; margin-top: 0;">AI Evaluation Report Ready</h2>
                  <p>Hello <strong>${recruiter.fullName || 'Recruiter'}</strong>,</p>
                  <p>The candidate <strong>${candidate.name}</strong> has completed their interview session for: <strong>${updatedCandidate.job.title}</strong>.</p>
                  
                  <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                    <span style="font-size: 12px; font-weight: bold; color: #7c3aed; text-transform: uppercase; tracking-spacing: 0.05em;">AI Match Score</span>
                    <div style="font-size: 40px; font-weight: 800; color: #7c3aed; margin: 8px 0;">${score}%</div>
                    <span style="font-size: 11px; font-weight: bold; color: #7c3aed; background-color: #ddd6fe; padding: 3px 8px; border-radius: 10px;">
                      ${score >= 90 ? 'Outstanding Match' : score >= 70 ? 'Strong Match' : score > 0 ? 'Review Needed' : 'Evaluation Pending'}
                    </span>
                  </div>

                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; font-weight: bold;">AI Feedback Summary:</p>
                    <p style="margin: 0; color: #475569; font-style: italic;">"${feedbackText}"</p>
                  </div>

                  <p>You can view the full transcript, details, and candidate feedback comments on your <a href="http://localhost:3000/dashboard/candidates" style="color: #7c3aed; font-weight: bold; text-decoration: none;">AIcruiter Dashboard</a>.</p>
                  
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email was sent automatically by AIcruiter. You can manage alert preferences in settings.</p>
                </div>
              `
          });
        }
      }
    } catch (err) {
      console.error("Failed to send evaluation report email:", err);
    }

    console.log(`[Worker] Successfully finalized candidate ${candidate.name} (${candidateId}) report state.`);

  } catch (error) {
    console.error(`[Worker] Error generating report for candidate ${candidateId}:`, error);
  }
}

export async function handleSQSEvent(event: any): Promise<void> {
  console.log(`[Worker] SQS Event received:`, JSON.stringify(event, null, 2));
  if (!event || !event.Records) {
    console.warn(`[Worker] Event has no Records`);
    return;
  }

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const candidateId = body.candidateId;
      if (!candidateId) {
        console.warn(`[Worker] Record body is missing candidateId:`, record.body);
        continue;
      }
      await generateCandidateReport(candidateId);
    } catch (error) {
      console.error(`[Worker] Failed to process SQS record:`, error, record.body);
    }
  }
}

