export type OccupancyBasePoint = { count: number; createdAt: string }
export type Address = { line1: string | null; city: string | null; postalCode: string | null; country: string | null; }
export type Club = {
  id: number; clubId: number; name: string; occupancies: OccupancyBasePoint[]; address: Address | null;
}
/** Period the recorded archive covers. Both null when nothing was ever recorded. */
export type ArchiveInfo = { firstRecordedAt: string | null; lastRecordedAt: string | null }