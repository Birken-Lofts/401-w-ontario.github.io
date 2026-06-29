export interface Category {
  id: string;
  label: string;
  color: string;
}

export interface Poi {
  name: string;
  cat: string;
  /** [lat, lng] — approximate placements; verify against confirmed coordinates before launch. */
  ll: [number, number];
  /** Walk time in minutes. */
  walk: number;
  blurb: string;
}

/** 401 W. Ontario Street — the map's home pin and center. */
export const HOME: [number, number] = [41.8935, -87.6388];

export const categories: Category[] = [
  { id: 'transit', label: 'Transit', color: '#7C97A8' },
  { id: 'dining', label: 'Dining & Nightlife', color: '#C4683A' },
  { id: 'culture', label: 'Galleries & Culture', color: '#B08968' },
  { id: 'grocery', label: 'Grocery', color: '#8B9A6B' },
  { id: 'parks', label: 'Parks', color: '#6E8B6E' },
  { id: 'landmark', label: 'Landmarks', color: '#C9A24B' },
  { id: 'fitness', label: 'Fitness', color: '#A86B6B' },
];

export const pois: Poi[] = [
  // Transit
  { name: 'Chicago & Franklin (Brown/Purple)', cat: 'transit', ll: [41.8966, -87.6356], walk: 3, blurb: 'Brown & Purple Line — into the Loop in minutes.' },
  { name: 'Grand (Red Line)', cat: 'transit', ll: [41.8918, -87.6281], walk: 7, blurb: '24/7 Red Line service across the city.' },
  { name: 'Merchandise Mart', cat: 'transit', ll: [41.8885, -87.6356], walk: 6, blurb: 'Brown & Purple Line + riverfront hub.' },
  { name: 'Riverwalk Water Taxi', cat: 'transit', ll: [41.8887, -87.6300], walk: 5, blurb: 'Seasonal water taxi along the Chicago River.' },
  // Dining
  { name: "Bavette's Bar & Boeuf", cat: 'dining', ll: [41.8902, -87.6336], walk: 4, blurb: 'River North steakhouse institution.' },
  { name: 'Gilt Bar', cat: 'dining', ll: [41.8896, -87.6347], walk: 3, blurb: 'Dim, romantic cocktails & American plates.' },
  { name: 'RPM Italian', cat: 'dining', ll: [41.8924, -87.6312], walk: 5, blurb: 'Buzzy modern Italian on Illinois St.' },
  { name: 'Beatnik', cat: 'dining', ll: [41.8932, -87.6468], walk: 6, blurb: 'Globally inspired dining & design.' },
  // Culture
  { name: 'River North Gallery District', cat: 'culture', ll: [41.8958, -87.6350], walk: 2, blurb: "Chicago's densest concentration of art galleries." },
  { name: 'Holy Name Cathedral', cat: 'culture', ll: [41.8966, -87.6286], walk: 9, blurb: 'Landmark 1875 Gothic cathedral.' },
  { name: 'House of Blues', cat: 'culture', ll: [41.8885, -87.6322], walk: 6, blurb: 'Live music on the riverfront.' },
  // Grocery
  { name: 'Whole Foods Market', cat: 'grocery', ll: [41.8896, -87.6420], walk: 6, blurb: 'Full-size grocery on Kingsbury.' },
  { name: 'Jewel-Osco', cat: 'grocery', ll: [41.8975, -87.6300], walk: 9, blurb: 'Everyday groceries & pharmacy.' },
  { name: 'Target', cat: 'grocery', ll: [41.8921, -87.6265], walk: 9, blurb: 'Essentials, home & grab-and-go.' },
  // Parks
  { name: 'Ward (Erie St) Park', cat: 'parks', ll: [41.8905, -87.6418], walk: 7, blurb: 'Riverfront green with skyline views.' },
  { name: 'Washington Square Park', cat: 'parks', ll: [41.8980, -87.6322], walk: 10, blurb: "Chicago's oldest public park." },
  { name: 'Chicago Riverwalk', cat: 'parks', ll: [41.8887, -87.6305], walk: 5, blurb: 'Promenade, cafés & kayaking along the river.' },
  // Landmarks
  { name: 'Magnificent Mile', cat: 'landmark', ll: [41.8955, -87.6240], walk: 8, blurb: 'Flagship shopping & the Mag Mile lights.' },
  { name: 'The Loop', cat: 'landmark', ll: [41.8836, -87.6289], walk: 10, blurb: "Downtown's business & theater core." },
  { name: 'Chicago River', cat: 'landmark', ll: [41.8895, -87.6310], walk: 5, blurb: 'The river that defines River North.' },
  // Fitness
  { name: 'East Bank Club', cat: 'fitness', ll: [41.8905, -87.6392], walk: 6, blurb: 'Legendary 450,000 sq ft athletic club.' },
  { name: 'Fitness Formula Club', cat: 'fitness', ll: [41.8928, -87.6305], walk: 5, blurb: 'Full-service neighborhood gym.' },
  { name: 'CorePower Yoga', cat: 'fitness', ll: [41.8918, -87.6290], walk: 7, blurb: 'Heated vinyasa & sculpt classes.' },
];
