import { prisma } from '@aicruiter/db';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

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

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the interview transcript for candidate ${candidate.name}:\n\n${dialog}` }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const completionText = response.choices[0]?.message?.content || "{}";
    let reportData = { overallScore: 70, feedback: "Interview completed." };
    try {
      reportData = JSON.parse(completionText);
    } catch (e) {
      console.error("[Worker] Failed to parse JSON response from Groq:", completionText);
    }

    // 4. Update Candidate metadata in DB
    const currentMeta = typeof candidate.metaData === 'object' && candidate.metaData ? candidate.metaData : {};
    const updatedMeta = {
      ...currentMeta,
      overallScore: reportData.overallScore || 70,
      feedback: reportData.feedback || "Good technical skills demonstrated.",
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
        details: `${candidate.name} finished the interview with a match score of ${updatedMeta.overallScore}%`
      }
    });

    console.log(`[Worker] Successfully saved AI report for candidate ${candidate.name} (${candidateId})`);

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

