import { SSTConfig } from "sst";
import { Api, Queue, Function } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "aicruiter",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // Enforce Node.js 20 as the default runtime for all Lambda functions in this app
      app.setDefaultFunctionProps({
        runtime: "nodejs20.x",
      });

      // 1. Create SQS queue for report worker
      const queue = new Queue(stack, "ReportQueue", {
        consumer: {
          function: {
            runtime: "nodejs20.x",
            handler: "apps/api/src/services/report-worker.handleSQSEvent",
            environment: {
              DATABASE_URL: process.env.DATABASE_URL || "",
              NEXT_REPORT_API_KEY: process.env.NEXT_REPORT_API_KEY || "",
              NEXT_GROQ_API_KEY: process.env.NEXT_GROQ_API_KEY || "",
              GROQ_API_KEY: process.env.GROQ_API_KEY || "",
            },
          },
        },
      });

      // 2. Fastify API via AWS Lambda Web Adapter (Docker container)
      const apiFunction = new Function(stack, "ApiFunction", {
        runtime: "container",
        handler: ".",
        container: {
          file: "apps/api/Dockerfile",
        },
        timeout: "30 seconds",
        environment: {
          DATABASE_URL: process.env.DATABASE_URL || "",
          DIRECT_URL: process.env.DIRECT_URL || "",
          AWS_SQS_QUEUE_URL: queue.queueUrl,
          CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
          NEXT_DEEPGRAM_API_KEY: process.env.NEXT_DEEPGRAM_API_KEY || "",
          DAILY_API_KEY: process.env.DAILY_API_KEY || "",
        },
      });

      // Bind SQS queue to the API function so it has permissions to send messages to it
      apiFunction.bind([queue]);

      const api = new Api(stack, "api", {
        routes: {
          "ANY /{proxy+}": apiFunction,
        },
      });

      // Note: Next.js (apps/web) is deployed via Vercel.
      // Only the API and Queue are managed here in AWS.
      stack.addOutputs({
        ApiUrl: api.url,
      });
    });
  },
} satisfies SSTConfig;
