// Shared in-memory store for active rounds
// roundId -> actualQuestion
const g = globalThis as typeof globalThis & { activeRounds?: Map<string, string> };
if (!g.activeRounds) g.activeRounds = new Map<string, string>();
export const activeRounds = g.activeRounds;
