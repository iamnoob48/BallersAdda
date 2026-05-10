import { Queue, Worker } from "bullmq";
import connection from "../config/bullmqConnection.js";
import prisma from "../prismaClient.js";
import { generateRandomBracket } from "./matchmakingService.js";

const QUEUE_NAME = "bracket-generation";

export const bracketQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
  },
});

export function startBracketWorker() {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { tournamentId } = job.data;
      console.log(`[BracketWorker] Processing bracket for tournament ${tournamentId} (attempt ${job.attemptsMade + 1})`);
      await generateRandomBracket(tournamentId);

      const t = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: { bracketStatus: true },
      });
      if (t?.bracketStatus === "FAILED") {
        throw new Error(
          `Bracket generation marked FAILED for tournament ${tournamentId}`
        );
      }
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[BracketWorker] Bracket job ${job.id} completed for tournament ${job.data.tournamentId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[BracketWorker] Bracket job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
  });

  worker.on("error", (err) => {
    console.error("[BracketWorker] Worker error:", err.message);
  });

  console.log("[BracketWorker] Bracket generation worker started");
  return worker;
}

export async function enqueueBracketGeneration(tournamentId) {
  const jobId = `bracket-${tournamentId}`;
  await bracketQueue.add(
    "generate-bracket",
    { tournamentId },
    { jobId, deduplication: { id: jobId } }
  );
  console.log(`[BracketQueue] Enqueued bracket generation for tournament ${tournamentId}`);
}
