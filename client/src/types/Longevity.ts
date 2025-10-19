// client/src/types/Longevity.ts

export type LongevityInput = {
    materials: { material: string; percentage: number }[];
    gsm?: number;
    weave?: string;
    stretchPct?: number;
    construction?: { stitchesPerInch?: number; seams?: string; reinforcement?: boolean };
    care?: { method?: string; dryer?: boolean; temp?: "cold" | "warm" | "hot" };
    usage?: { frequencyPerWeek?: number; activity?: "casual" | "workout" | "formal" | "outdoor" };
    reviews?: { avgRating?: number; volume?: number };
    price?: number;
  };
  
  export type LongevityResponse = {
    predictedWears: number;
    predictedMonthsTypical: number;
    careLevel: "low" | "medium" | "high" | "standard" | "gentle" | "delicate";
    confidence: number;
    compositeScore: number;
    baseFabricScore: number;
    factors: {
      gsm: number;
      weave: number;
      stretch: number;
      construction: number;
      care: number;
      usage: number;
      reviews: number;
      price: number;
    };
    lifeYears: number;
    ecoCostScore: number;
    qualityScore: number;
  };
  