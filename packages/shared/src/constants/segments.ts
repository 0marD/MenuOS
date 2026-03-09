export const CUSTOMER_SEGMENTS = ['new', 'frequent', 'dormant'] as const;
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];

export const DORMANT_THRESHOLD_DAYS = 21;
export const FREQUENT_VISIT_THRESHOLD = 3;

export function getSegmentFromVisitCount(visitCount: number, daysSinceLastVisit: number): CustomerSegment {
  if (daysSinceLastVisit >= DORMANT_THRESHOLD_DAYS) return 'dormant';
  if (visitCount >= FREQUENT_VISIT_THRESHOLD) return 'frequent';
  return 'new';
}
