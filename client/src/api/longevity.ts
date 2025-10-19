import type { LongevityInput, LongevityResponse } from "../types/Longevity";

function toGeminiShape(input: LongevityInput) {
  const wash =
    [
      input.care?.method ? String(input.care.method) : "",
      input.care?.temp ? String(input.care.temp) : "",
      input.care?.dryer ? "tumble dry" : "line dry"
    ]
      .filter(Boolean)
      .join(" ");

  return {
    materials: (input.materials || []).map(m => ({
      material: m.material,
      percentage: m.percentage
    })),
    gsm: input.gsm,
    weave: input.weave,
    stretchPercent: input.stretchPct,
    construction: input.construction
      ? {
          stitchPerInch: input.construction.stitchesPerInch,
          seams: input.construction.seams,
          reinforcement: input.construction.reinforcement ? "yes" : "",
          closuresQuality: ""
        }
      : undefined,
    "wash-instructions": wash,
    usage: input.usage
      ? {
          frequency: String(input.usage.frequencyPerWeek ?? ""),
          intensity: input.usage.activity ?? "",
          profile: ""
        }
      : undefined,
    reviews: input.reviews
      ? {
          avgRating: input.reviews.avgRating,
          rating: input.reviews.avgRating,
          mentions: []
        }
      : undefined,
    "product-price": input.price ? { amount: input.price } : undefined,
    category: ""
  };
}

export async function fetchLongevity(body: LongevityInput): Promise<LongevityResponse> {
  const payload = toGeminiShape(body);
  const res = await fetch("http://localhost:3000/api/predict-durability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to fetch longevity (status ${res.status}) ${msg}`);
  }
  return (await res.json()) as LongevityResponse;
}
