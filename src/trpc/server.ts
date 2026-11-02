import "server-only";
import { createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";

export const api = createCallerFactory(appRouter)({});
