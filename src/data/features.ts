export type FeatureTag = 'Est. 1905' | 'All-new' | 'River North';

export interface Feature {
  n: string;
  title: string;
  description: string;
  tag: FeatureTag;
}

export const features: Feature[] = [
  { n: '01', title: 'Exposed Heavy Timber', description: 'Original 1905 beams and columns, preserved.', tag: 'Est. 1905' },
  { n: '02', title: 'Historic Brick Walls', description: 'Authentic masonry with a century of character.', tag: 'Est. 1905' },
  { n: '03', title: 'New Arched Windows', description: 'Brand-new glazing in the original arched openings.', tag: 'All-new' },
  { n: '04', title: 'Modern HVAC', description: 'All-new heating and cooling, per residence.', tag: 'All-new' },
  { n: '05', title: '1 Gbps Internet', description: 'Gigabit wired to every home.', tag: 'All-new' },
  { n: '06', title: 'Wood Plank Flooring', description: 'New floors that complement the original timber.', tag: 'All-new' },
  { n: '07', title: 'In-Unit Laundry', description: 'Full-size washer and dryer in every unit.', tag: 'All-new' },
  { n: '08', title: 'Modern Kitchens', description: 'Contemporary finishes and new appliances.', tag: 'All-new' },
  { n: '09', title: 'Fitness & Co-Working', description: 'On-site gym plus dedicated co-working.', tag: 'All-new' },
  { n: '10', title: 'Bike Storage', description: 'Secure indoor storage for every cyclist.', tag: 'All-new' },
  { n: '11', title: 'New Elevator', description: 'Modern elevator serving all floors.', tag: 'All-new' },
  { n: '12', title: 'River North Location', description: 'Steps from galleries, dining and downtown.', tag: 'River North' },
];
