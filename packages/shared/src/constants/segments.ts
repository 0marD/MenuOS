export const SEGMENTS = {
  NEW: 'new',
  FREQUENT: 'frequent',
  DORMANT: 'dormant',
} as const;

export type Segment = (typeof SEGMENTS)[keyof typeof SEGMENTS];

export const DORMANT_THRESHOLD_DAYS = 21;
export const FREQUENT_VISIT_THRESHOLD = 3;
