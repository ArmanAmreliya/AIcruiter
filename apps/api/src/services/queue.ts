import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { generateCandidateReport } from './report-worker';

const sqsQueueUrl = process.env.AWS_SQS_QUEUE_URL;

const sqsClient = sqsQueueUrl
  ? new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' })
  : null;

export async function queueCandidateReportJob(candidateId: string): Promise<void> {
  if (sqsQueueUrl && sqsClient) {
    console.log(`[Queue] Enqueuing SQS job for candidate ${candidateId}...`);
    try {
      const command = new SendMessageCommand({
        QueueUrl: sqsQueueUrl,
        MessageBody: JSON.stringify({ candidateId }),
      });
      await sqsClient.send(command);
      console.log(`[Queue] Successfully enqueued SQS job for candidate ${candidateId}`);
    } catch (error) {
      console.error(`[Queue] Failed to enqueue to SQS, falling back to local processing:`, error);
      setImmediate(() => {
        generateCandidateReport(candidateId).catch(err => {
          console.error(`[Queue Fallback] Error in report generation for candidate ${candidateId}:`, err);
        });
      });
    }
  } else {
    console.log(`[Queue] AWS_SQS_QUEUE_URL not configured. Processing candidate ${candidateId} locally in-memory via setImmediate.`);
    setImmediate(() => {
      generateCandidateReport(candidateId).catch(err => {
        console.error(`[Queue Fallback] Error in report generation for candidate ${candidateId}:`, err);
      });
    });
  }
}
