# Interview Room Voice Pipeline Root Cause

The interview room workflow is wired through [apps/web/components/interview/InterviewRoom.tsx](apps/web/components/interview/InterviewRoom.tsx), which starts [apps/web/hooks/useAIInterviewer.ts](apps/web/hooks/useAIInterviewer.ts). The backend Groq key is available, so the failure is not an API-key outage.

Root cause:

The STT pipeline keeps listening while Sarah is speaking. Her TTS audio and the candidate mic share the same live loop, so Deepgram can consume assistant audio bleed as if it were candidate speech. That contaminates the turn-taking flow, can trigger the fallback transcription path at the wrong time, and prevents the interview from cleanly moving from Sarah's greeting into the candidate's first answer.

Secondary issue:

The hook relied on the render-time `history` array inside the Deepgram callback and inside the first greeting gate. That creates stale context risk for later turns and makes the conversation state less reliable than it should be.

Solution applied:

Pause mic capture while Sarah is speaking, ignore STT events during assistant speech, and keep the conversation history in a ref that stays in sync with the latest turn. That keeps the Deepgram stream focused on the candidate and preserves the dialogue context for Groq.

Files involved:

- [apps/web/hooks/useAIInterviewer.ts](apps/web/hooks/useAIInterviewer.ts)
- [apps/web/components/interview/InterviewRoom.tsx](apps/web/components/interview/InterviewRoom.tsx)
