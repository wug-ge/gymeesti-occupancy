export type OccupancyBasePoint = { count: number; createdAt: string }
export type Address = { line1: string | null; city: string | null; postalCode: string | null; country: string | null; }
export type Club = {
  id: number; clubId: number; name: string; occupancies: OccupancyBasePoint[]; address: Address | null;
}