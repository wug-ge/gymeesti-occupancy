export type OccupancyBasePoint = { count: number; createdAt: string }
export type Club = {
  id: number; clubId: number; name: string; occupancies: OccupancyBasePoint[];
}