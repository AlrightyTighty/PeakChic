import { GeminiShape } from "../types/GeminiShape";

type Numeric = number | null | undefined;

type Construction = {
  stitchPerInch?: Numeric;
  seams?: Numeric;
  reinforcement?: boolean | null;
  closuresQuality?: Numeric;
};

type FactorsOut = {
  gsm: number | null;
  weave: number | null;
  stretch: number | null;
  construction: number | null;
  care: number | null;
  usage: number | null;
  reviews: number | null;
  price: number | null;
};

type Result = {
  lifeYears: number;
  ecoCostScore: number;
  qualityScore: number;
  predictedWears: number;
  predictedMonthsTypical: number;
  careLevel: "low" | "medium" | "high";
  confidence: number;
  compositeScore: number;
  baseFabricScore: number;
  factors: FactorsOut;
};

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const nz = (v: Numeric, fallback: number) => (v == null || Number.isNaN(Number(v)) ? fallback : Number(v));

const pct = (materials?: { material: string; percentage: number }[]) => {
  const m = materials ?? [];
  const sum = m.reduce((a, b) => a + (b.percentage ?? 0), 0) || 1;
  const get = (needle: RegExp) =>
    clamp(
      m.filter(x => needle.test((x.material || "").toLowerCase()))
        .reduce((a, b) => a + (b.percentage ?? 0), 0) / sum,
      0,
      1
    );
  return {
    cotton: get(/cotton/),
    wool: get(/wool|cashmere|merino/),
    linen: get(/linen|flax/),
    silk: get(/silk/),
    nylon: get(/nylon|polyamide/),
    polyester: get(/polyester/),
    elastane: get(/elastane|spandex|lycra/),
    leather: get(/leather/),
    rayon: get(/rayon|viscose|modal|lyocell|tencel/),
  };
};

const inferKnitProbability = (materials?: { material: string; percentage: number }[], stretchPercent?: Numeric, category?: string) => {
  const p = pct(materials);
  const s = nz(stretchPercent, NaN);
  const cat = (category || "").toLowerCase();
  let prob = 0.5;
  if (Number.isFinite(s)) prob += s >= 5 ? 0.25 : s > 0 ? 0.12 : -0.08;
  prob += p.elastane >= 0.03 ? 0.2 : 0;
  prob += /t[-\s]?shirt|tee|sweat|hoodie|legging|yoga|active|knit|rib|sweater|cardigan/.test(cat) ? 0.25 : 0;
  prob -= /jean|denim|chino|trouser|oxford|poplin|dress shirt|jacket|coat|blazer|gabardine|canvas|ripstop/.test(cat) ? 0.25 : 0;
  return clamp(prob);
};

const scoreWeave = (weave?: string, knitProb?: number, gsm?: Numeric) => {
  const w = (weave || "").toLowerCase();
  if (w) {
    if (/twill|denim|gabardine/.test(w)) return 0.8;
    if (/canvas|oxford|ripstop|herringbone/.test(w)) return 0.85;
    if (/plain|poplin|percale|sateen|basket/.test(w)) return 0.65;
    if (/knit|jersey|rib|interlock|french.*terry|fleece/.test(w)) return 0.55;
    return 0.6;
  }
  const knit = clamp(knitProb ?? 0.5);
  const g = nz(gsm, NaN);
  let knitScore = 0.55;
  if (Number.isFinite(g)) {
    if (g >= 320) knitScore += 0.05;
    else if (g <= 160) knitScore -= 0.03;
  }
  const wovenScore = 0.7;
  return clamp(wovenScore * (1 - knit) + knitScore * knit);
};

const scoreStretch = (stretchPercent?: Numeric, materials?: { material: string; percentage: number }[]) => {
  let s = nz(stretchPercent, NaN);
  if (!Number.isFinite(s) && materials) {
    const p = pct(materials);
    s = p.elastane * 200 + p.nylon * 50 + p.polyester * 25;
  }
  if (!Number.isFinite(s)) s = 0;
  if (s <= 0) return 0.8;
  if (s <= 2) return 0.72;
  if (s <= 5) return 0.64;
  if (s <= 10) return 0.56;
  return 0.48;
};

const scoreGsm = (gsm?: Numeric) => {
  const g = nz(gsm, 0);
  if (g <= 0) return 0.6;
  if (g < 140) return 0.55;
  if (g < 220) return 0.65;
  if (g < 320) return 0.75;
  if (g < 450) return 0.82;
  return 0.86;
};

const scoreConstruction = (c?: Construction) => {
  const spi = clamp((nz(c?.stitchPerInch, NaN) - 6) / (12 - 6));
  const seams = clamp((nz(c?.seams, NaN) - 4) / (12 - 4));
  const closures = clamp((nz(c?.closuresQuality, NaN) - 2) / (5 - 2));
  const reinforce = c?.reinforcement == null ? 0.5 : c?.reinforcement ? 1 : 0.25;
  const known = [Number.isFinite(nz(c?.stitchPerInch, NaN)), Number.isFinite(nz(c?.seams, NaN)), Number.isFinite(nz(c?.closuresQuality, NaN)), c?.reinforcement != null].filter(Boolean).length;
  const w = known === 0 ? 0 : (spi * 0.35 + seams * 0.25 + closures * 0.2 + reinforce * 0.2);
  return { score: clamp(w), coverage: known / 4 };
};

const scoreCare = (washInstructions?: string | null, washTempC?: Numeric) => {
  const txt = (washInstructions || "").toLowerCase();
  const temp = nz(washTempC, NaN);
  const del = /dry\s*clean|delicate|hand\s*w/i.test(txt);
  const bleach = /bleach/.test(txt);
  const tumbleHot = /tumble.*(hot|high)/.test(txt);
  const lowTemp = Number.isFinite(temp) ? (temp <= 30 ? 1 : temp <= 40 ? 0.8 : temp <= 60 ? 0.6 : 0.4) : /cold|cool/.test(txt) ? 0.9 : /warm/.test(txt) ? 0.7 : /hot/.test(txt) ? 0.5 : 0.7;
  const careBurden = (del ? 0.6 : 0.85) * (bleach ? 0.8 : 1) * (tumbleHot ? 0.85 : 1) * lowTemp;
  const level: "low" | "medium" | "high" = careBurden >= 0.8 ? "low" : careBurden >= 0.6 ? "medium" : "high";
  return { score: clamp(careBurden), level };
};

const scoreUsage = (category?: string) => {
  const c = (category || "").toLowerCase();
  if (/jean|denim|workwear|jacket|coat/.test(c)) return 0.85;
  if (/t[-\s]?shirt|tee|top|dress|skirt|blouse/.test(c)) return 0.65;
  if (/active|legging|yoga|sports/.test(c)) return 0.55;
  if (/underwear|sock|intimate/.test(c)) return 0.45;
  return 0.6;
};

const scoreReviews = (reviews?: { average?: number; count?: number } | number) => {
  if (typeof reviews === "number") return clamp((reviews - 3) / 2);
  const avg = nz((reviews as any)?.average, NaN);
  const cnt = nz((reviews as any)?.count, NaN);
  const conf = Number.isFinite(cnt) ? clamp(Math.log10(1 + cnt) / 3) : 0.3;
  const s = Number.isFinite(avg) ? clamp((avg - 3) / 2) : 0.6;
  return clamp(0.6 * s + 0.4 * conf);
};

const scorePrice = (price?: { amount?: number }) => {
  const p = nz(price?.amount, NaN);
  if (!Number.isFinite(p)) return 0.6;
  const scaled = clamp(Math.log10(Math.max(10, p)) / Math.log10(500));
  return clamp(0.3 + 0.7 * scaled);
};

const baseFabric = (m: GeminiShape["materials"]) => {
  const p = pct(m);
  const natural = p.cotton + p.wool + p.linen + p.silk + p.leather;
  const synthetics = p.nylon + p.polyester + p.elastane + p.rayon;
  const elasticPenalty = p.elastane * 0.35;
  const fragileBonus = p.wool * 0.1 + p.silk * 0.05 + p.linen * 0.08;
  const sturdyBonus = p.cotton * 0.1 + p.leather * 0.15;
  const s = clamp(0.55 + 0.35 * natural - 0.25 * synthetics - elasticPenalty + fragileBonus + sturdyBonus);
  return { score: s, elastanePct: p.elastane, polyesterPct: p.polyester, nylonPct: p.nylon, naturalPct: natural };
};

const ecoCost = (materialsScore: ReturnType<typeof baseFabric>, washTempC?: Numeric, country?: string | null) => {
  const temp = nz(washTempC, NaN);
  const wash = Number.isFinite(temp) ? clamp(1 - (temp - 20) / 60) : 0.7;
  const fiber = clamp(1 - (materialsScore.polyesterPct * 0.6 + materialsScore.nylonPct * 0.6 + materialsScore.elastanePct * 0.4));
  const ship = country && /usa|united\s*states|canada|mexico|uk|germany|france|italy|spain|portugal|turkey/i.test(country) ? 0.7 : 0.6;
  return clamp(0.45 * fiber + 0.35 * wash + 0.2 * ship);
};

export function predictLongevity(input: GeminiShape & { countryOfOrigin?: string | null; washTempC?: number | null }): Result {
  const fabric = baseFabric(input.materials);
  const gsmS = scoreGsm(input.gsm);
  const knitProb = inferKnitProbability(input.materials, input.stretchPercent ?? null, input.category);
  const weaveS = scoreWeave(input.weave, knitProb, input.gsm);
  const stretchS = scoreStretch(input.stretchPercent, input.materials);
  const { score: consS, coverage: consCov } = scoreConstruction(input.construction);
  const { score: careS, level: careLevel } = scoreCare(input["wash-instructions"], input.washTempC);
  const usageS = scoreUsage(input.category);
  const reviewsS = scoreReviews((input as any).reviews);
  const priceS = scorePrice((input as any)["product-price"]);

  const signals = [
    Number.isFinite(nz(input.gsm, NaN)),
    !!input.weave || knitProb !== undefined,
    Number.isFinite(nz(input.stretchPercent, NaN)) || (input.materials?.length ?? 0) > 0,
    consCov > 0,
    !!input["wash-instructions"] || Number.isFinite(nz(input.washTempC, NaN)),
    !!input.category,
    (input as any).reviews != null,
    (input as any)["product-price"] != null,
    (input as any).materials != null && (input as any).materials!.length > 0,
  ];
  const coverage = signals.filter(Boolean).length / signals.length;

  const durability = clamp(
    0.30 * fabric.score +
      0.14 * gsmS +
      0.10 * weaveS +
      0.10 * stretchS +
      0.16 * consS +
      0.10 * usageS +
      0.10 * reviewsS
  );

  const quality = clamp(
    0.28 * consS +
      0.22 * fabric.score +
      0.16 * weaveS +
      0.10 * gsmS +
      0.12 * priceS +
      0.12 * reviewsS
  );

  const eco = ecoCost(fabric, input.washTempC ?? null, (input as any).countryOfOrigin ?? null);

  const lifeYears = clamp(durability * 0.9 + careS * 0.1) * 8 + 1;
  const predictedWears = Math.round(lifeYears * 45 * (0.6 + usageS * 0.8));
  const predictedMonthsTypical = Math.round(lifeYears * 12 * (0.5 + usageS * 0.6));
  const confidence = clamp(0.45 + 0.55 * coverage);
  const compositeScore = clamp(0.4 * durability + 0.3 * quality + 0.3 * eco);
  const factors: FactorsOut = {
    gsm: Number.isFinite(nz(input.gsm, NaN)) ? gsmS : null,
    weave: input.weave ? weaveS : knitProb != null ? weaveS : null,
    stretch: Number.isFinite(nz(input.stretchPercent, NaN)) || (input.materials?.length ?? 0) > 0 ? stretchS : null,
    construction: consCov > 0 ? consS : null,
    care: careS || 0,
    usage: input.category ? usageS : null,
    reviews: (input as any).reviews != null ? reviewsS : null,
    price: (input as any)["product-price"] != null ? priceS : null,
  };

  return {
    lifeYears: Number(lifeYears.toFixed(1)),
    ecoCostScore: Number((eco * 10).toFixed(1)),
    qualityScore: Number((quality * 10).toFixed(1)),
    predictedWears,
    predictedMonthsTypical,
    careLevel,
    confidence: Number(confidence.toFixed(2)),
    compositeScore: Number((compositeScore * 10).toFixed(1)),
    baseFabricScore: Number((fabric.score * 10).toFixed(1)),
    factors,
  };
}
