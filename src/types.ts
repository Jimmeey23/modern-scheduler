export type Tag =
  | "mix"
  | "new"
  | "best"
  | "historic"
  | "evidence"
  | "constraint"
  | "experimental"
  | "protected"
  | "low"
  | "violation";

export type ViewId =
  | "grid"
  | "timeline"
  | "list"
  | "trainer"
  | "multi"
  | "city"
  | "heatmap"
  | "rooms"
  | "analytics"
  | "control"
  | "report";

export type Location = {
  id: string;
  name: string;
  area: string;
  rooms: number;
  accent: string;
};

export type Trainer = {
  id: string;
  name: string;
  photo: string;
  specialty: string;
};

export type Format = {
  name: string;
  studio: string;
  duration: number;
  accent: string;
};

export type Session = {
  id: string;
  locationId: string;
  day: number;
  time: string;
  name: string;
  studio: string;
  duration: number;
  trainerId: string;
  score: number;
  fill: number;
  avg: number;
  tags: Tag[];
  accent: string;
};

export type AppState = {
  locationId: string;
  view: ViewId;
  query: string;
  selectedId: string | null;
  focusTrainer: string | null;
  pinned: string[];
  reassigned: Record<string, string>;
  optimized: boolean;
};
