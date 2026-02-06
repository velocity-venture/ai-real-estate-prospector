export function calculateIntentScore(equityPercent: number, yearsOwned: number): number {
  const equityScore = Math.min(equityPercent / 100, 1) * 60;
  const ownershipScore = Math.min(yearsOwned / 20, 1) * 40;
  return Math.round(Math.min(Math.max(equityScore + ownershipScore, 0), 100));
}
