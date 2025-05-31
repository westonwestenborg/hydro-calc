export type Crop = {
  id: string;
  name: string;
  category: "leafy" | "herb" | "fruiting";
  ecRange: [number, number];
  gramsPerLiter: { mb: number; can: number; mgso4: number };
};
