import { SSTConfig } from "sst";
import { Api, NextjsSite, Queue, Function } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "aicruiter",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // 1. Create SQS queue for report worker
      const queue = new Queue(stack, "ReportQueue", {
        consumer: {
          function: {
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

      // 3. Next.js Web App Site
      const web = new NextjsSite(stack, "web", {
        path: "apps/web",
        environment: {
          NEXT_PUBLIC_API_URL: api.url,
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
          CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
          DATABASE_URL: process.env.DATABASE_URL || "",
          NEXT_SUPABASE_URL: process.env.NEXT_SUPABASE_URL || "",
          NEXT_SUPABASE_ANON_KEY: process.env.NEXT_SUPABASE_ANON_KEY || "",
          NEXT_DEEPGRAM_API_KEY: process.env.NEXT_DEEPGRAM_API_KEY || "",
          DAILY_API_KEY: process.env.DAILY_API_KEY || "",
          DAILY_ROOM_URL: process.env.DAILY_ROOM_URL || "",
          NEXT_AI_API_KEY: process.env.NEXT_AI_API_KEY || "",
          NEXT_REPORT_API_KEY: process.env.NEXT_REPORT_API_KEY || "",
        },
      });

      stack.addOutputs({
        ApiUrl: api.url,
        SiteUrl: web.url,
      });
    });
  },
} satisfies SSTConfig;
