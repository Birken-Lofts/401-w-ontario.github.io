export type MilestoneState = 'complete' | 'next' | 'upcoming';

export interface Milestone {
  /** Combined date + status, e.g. "Oct 2026 · Next". */
  label: string;
  title: string;
  description: string;
  state: MilestoneState;
}

export const milestones: Milestone[] = [
  {
    label: '2025 · Complete',
    title: 'Design & Planning',
    description: "Architectural plans developed in careful keeping with the building's 1905 heritage.",
    state: 'complete',
  },
  {
    label: 'Early 2026 · Complete',
    title: 'Permits & Approvals',
    description: 'Historic preservation review passed and building permits secured.',
    state: 'complete',
  },
  {
    label: 'Oct 2026 · Next',
    title: 'Construction Begins',
    description: 'Adaptive-reuse construction commences on the historic building.',
    state: 'next',
  },
  {
    label: 'Oct 2027 · Move-in',
    title: 'First Deliveries',
    description: 'Residents move into their new loft homes in the heart of River North.',
    state: 'upcoming',
  },
];
