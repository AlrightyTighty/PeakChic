export type Material = { material: string; percentage: number };

export type GeminiShape = {
  "product-name"?: string;
  "product-brand"?: string;
  "product-price"?: { amount?: number; currency?: string };
  materials?: Material[];
  "wash-instructions"?: string;
  category?: string;
  gsm?: number;
  weave?: string;
  stretchPercent?: number;
  construction?: {
    stitchPerInch?: number;
    seams?: string;
    reinforcement?: string;
    closuresQuality?: string;
  };
  usage?: { intensity?: string; frequency?: string; profile?: string };
  reviews?: { avgRating?: number; rating?: number; mentions?: string[] };
};

type Factors = {
  gsm: number;
  weave: number;
  stretch: number;
  construction: number;
  care: number;
  usage: number;
  reviews: number;
  price: number;
};

export type Durability = {
  predictedWears: number;
  predictedMonthsTypical: number;
  careLevel: "standard" | "gentle" | "delicate";
  confidence: number;
  compositeScore: number;
  baseFabricScore: number;
  factors: Factors;
};

const FABRIC_BASE: Record<string, number> = {
  cotton: 0.72,
  organic_cotton: 0.75,
  pima_cotton: 0.78,
  linen: 0.8,
  hemp: 0.85,
  wool: 0.88,
  merino_wool: 0.9,
  cashmere: 0.7,
  silk: 0.68,
  polyester: 0.83,
  recycled_polyester: 0.81,
  nylon: 0.86,
  elastane: 0.55,
  spandex: 0.55,
  acrylic: 0.6,
  rayon: 0.62,
  viscose: 0.64,
  modal: 0.66,
  lyocell: 0.7,
  tencel: 0.72,
  acetate: 0.58,
  leather: 0.95,
  faux_leather: 0.78,
  denim: 0.88
};

function norm(n?: string) { return (n || "").toLowerCase().replace(/\s+/g, "_"); }
function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)); }
function num(x: unknown, d = 0) { const v = Number(x); return Number.isFinite(v) ? v : d; }

function inferBase(name: string) {
  if (/denim/.test(name)) return FABRIC_BASE.denim;
  if (/hemp/.test(name)) return FABRIC_BASE.hemp;
  if (/linen/.test(name)) return FABRIC_BASE.linen;
  if (/merino/.test(name)) return FABRIC_BASE.merino_wool;
  if (/wool/.test(name)) return FABRIC_BASE.wool;
  if (/cashmere/.test(name)) return FABRIC_BASE.cashmere;
  if (/silk/.test(name)) return FABRIC_BASE.silk;
  if (/(lyocell|tencel)/.test(name)) return FABRIC_BASE.lyocell;
  if (/(rayon|viscose)/.test(name)) return FABRIC_BASE.rayon;
  if (/(polyester|poly)/.test(name)) return FABRIC_BASE.polyester;
  if (/nylon/.test(name)) return FABRIC_BASE.nylon;
  if (/(spandex|elastane)/.test(name)) return FABRIC_BASE.elastane;
  if (/modal/.test(name)) return FABRIC_BASE.modal;
  if (/acetate/.test(name)) return FABRIC_BASE.acetate;
  if (/leather/.test(name)) return FABRIC_BASE.leather;
  if (/cotton/.test(name)) return FABRIC_BASE.cotton;
  return 0.72;
}

function fabricScore(materials?: Material[]) {
  if (!materials?.length) return 0.72;
  let total = 0, score = 0;
  for (const m of materials) {
    const base = FABRIC_BASE[norm(m.material)] ?? inferBase(norm(m.material));
    const pct = clamp(num(m.percentage), 0, 100) / 100;
    score += base * pct;
    total += pct;
  }
  return total > 0 ? score / total : 0.72;
}

function fGSM(gsm?: number, category?: string) {
  const g = num(gsm); if (!g) return 1;
  const cat = (category || "").toLowerCase();
  const t = /tee|tshirt|t-shirt/.test(cat) ? 160 : /shirt|blouse/.test(cat) ? 140 : /hoodie|sweat|fleece/.test(cat) ? 300 : /denim|jean|jacket|coat/.test(cat) ? 380 : /pants|trouser|short/.test(cat) ? 240 : 200;
  const r = clamp((g - t) / (t * 0.8), -0.5, 0.6);
  return 1 + r;
}
function fWeave(weave?: string) {
  const w = (weave || "").toLowerCase();
  if (/twill|denim|herringbone|oxford/.test(w)) return 1.12;
  if (/plain|poplin|basket/.test(w)) return 1.03;
  if (/knit|jersey|rib/.test(w)) return 0.96;
  return 1;
}
function fStretch(stretchPercent?: number) {
  const s = clamp(num(stretchPercent), 0, 100);
  if (!s) return 1;
  if (s <= 2) return 1;
  if (s <= 6) return 0.98;
  if (s <= 12) return 0.95;
  return 0.9;
}
function fConstruction(c?: GeminiShape["construction"]) {
  if (!c) return 1;
  const spi = num(c.stitchPerInch);
  const seams = (c.seams || "").toLowerCase();
  const reinforce = (c.reinforcement || "").toLowerCase();
  const closures = (c.closuresQuality || "").toLowerCase();
  let f = 1;
  if (spi) f *= clamp(0.9 + (spi / 12) * 0.15, 0.9, 1.15);
  if (/flat-fell|felled|overlock\+topstitch/.test(seams)) f *= 1.06;
  if (/bartack|taped|bound|double/.test(reinforce)) f *= 1.05;
  if (/ykk|riri|metal/.test(closures)) f *= 1.03;
  return f;
}
function fCare(wash?: string) {
  const s = (wash || "").toLowerCase();
  let f = 1;
  if (/hand wash|handwash|dry clean/.test(s)) f *= 0.92;
  if (/hot/.test(s)) f *= 0.95;
  if (/cold/.test(s)) f *= 1.02;
  if (/tumble dry low|line dry|air dry/.test(s)) f *= 1.02;
  return f;
}
function fUsage(usage?: GeminiShape["usage"], category?: string) {
  const u = ((usage?.intensity || usage?.frequency || usage?.profile) || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  let base = /outerwear|jacket|coat|denim/.test(cat) ? 1.15 : /pants|trouser|short/.test(cat) ? 1.05 : /shirt|tee|t-shirt|blouse/.test(cat) ? 0.95 : 1;
  if (/daily|heavy/.test(u)) base *= 0.92;
  if (/weekly|moderate/.test(u)) base *= 1;
  if (/occasion|light/.test(u)) base *= 1.06;
  return base;
}
function fReviews(rev?: GeminiShape["reviews"]) {
  if (!rev) return 1;
  const rating = num(rev.avgRating ?? rev.rating);
  const mentions = Array.isArray(rev.mentions) ? rev.mentions.join(" ").toLowerCase() : "";
  let f = 1;
  if (rating) f *= clamp(0.9 + (rating / 5) * 0.2, 0.9, 1.1);
  if (/pilling|shrink|shrank|fading|seam split|hole|tear|peel/.test(mentions)) f *= 0.93;
  return f;
}
function fPrice(amount?: number) {
  const p = num(amount); if (!p) return 1;
  const r = clamp((Math.log10(p) - 1.6) * 0.12, -0.08, 0.1);
  return 1 + r;
}
function confidence(d: GeminiShape) {
  let k = 0;
  if (d.materials?.length) k++;
  if (d.gsm) k++;
  if (d.weave) k++;
  if (d.stretchPercent != null) k++;
  if (d.construction) k++;
  if (d["wash-instructions"]) k++;
  if (d.usage) k++;
  if (d.reviews) k++;
  if (d["product-price"]?.amount) k++;
  return clamp(0.5 + k * 0.05, 0.5, 0.95);
}

export function predictLongevity(payload: GeminiShape): Durability {
  const base = fabricScore(payload.materials);
  const cg = fGSM(payload.gsm, payload.category);
  const cw = fWeave(payload.weave);
  const cs = fStretch(payload.stretchPercent);
  const cc = fConstruction(payload.construction);
  const ca = fCare(payload["wash-instructions"]);
  const cu = fUsage(payload.usage, payload.category);
  const cr = fReviews(payload.reviews);
  const cp = fPrice(payload["product-price"]?.amount);
  const composite = clamp(base * cg * cw * cs * cc * ca * cu * cr * cp, 0.45, 1.25);
  const predictedWears = Math.round(60 + composite * 240);
  const months = Math.round((predictedWears / 4) * (1 / (cu < 1 ? 0.9 : cu > 1 ? 1.1 : 1)));
  const careLevel = composite >= 0.95 ? "standard" : composite >= 0.8 ? "gentle" : "delicate";
  return {
    predictedWears,
    predictedMonthsTypical: months,
    careLevel,
    confidence: confidence(payload),
    compositeScore: Number(composite.toFixed(3)),
    baseFabricScore: Number(base.toFixed(3)),
    factors: {
      gsm: Number(cg.toFixed(3)),
      weave: Number(cw.toFixed(3)),
      stretch: Number(cs.toFixed(3)),
      construction: Number(cc.toFixed(3)),
      care: Number(ca.toFixed(3)),
      usage: Number(cu.toFixed(3)),
      reviews: Number(cr.toFixed(3)),
      price: Number(cp.toFixed(3))
    }
  };
}
