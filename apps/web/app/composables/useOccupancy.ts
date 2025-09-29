// composables/useOccupancy.ts
export type OccupancyPoint = { id: number; clubId: number; count: number; createdAt: string }
export type Club = {
  id: number; clubId: number; name: string; occupancies: OccupancyPoint[];
  // ...other fields ignored
}

const toDate = (iso: string) => new Date(iso)

export function sortByCreatedAt(pts: OccupancyPoint[]) {
  return [...pts].sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())
}

export function timeseries(club: Club) {
  const pts = sortByCreatedAt(club.occupancies)
  return pts.map(p => [toDate(p.createdAt), p.count]) as [Date, number][]
}

export function latest(club: Club) {
  if (!club.occupancies?.length) return undefined
  return club.occupancies.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
}

export function observedMax(club: Club) {
  return club.occupancies.reduce((m, p) => Math.max(m, p.count), 0)
}

export function groupByDay(club: Club) {
  const m = new Map<string, OccupancyPoint[]>()
  for (const p of club.occupancies) {
    const d = toDate(p.createdAt)
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    if (!m.has(key)) m.set(key, [])
    m.get(key)!.push(p)
  }
  for (const [k, arr] of m) arr.sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())
  return m
}

/** Average per hour bucket for Heatmap: returns { days, hours, matrix } */
export function hourlyHeatmapData(club: Club) {
  const byDay = groupByDay(club)
  const days = [...byDay.keys()].sort() // y-axis categories
  const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`) // x-axis

  // dayIndex x hourIndex → avg
  const matrix: [number, number, number][] = []
  days.forEach((dayKey, y) => {
    const pts = byDay.get(dayKey)!
    const bucket: { sum: number; n: number }[] = Array.from({ length: 24 }, () => ({ sum: 0, n: 0 }))
    for (const p of pts) {
      const h = toDate(p.createdAt).getHours()
      bucket[h].sum += p.count
      bucket[h].n += 1
    }
    bucket.forEach((b, x) => {
      const val = b.n ? Math.round((b.sum / b.n) * 10) / 10 : 0
      matrix.push([x, y, val])
    })
  })
  return { days, hours, matrix }
}
