import FabricChart from "../components/FabricChart";
import Scores from "../components/Scores";
import styles from "./Result.module.css";
import { useLongevity } from "../hooks/useLongevity";
import { useLocation } from "react-router";

export default function Result() {
  const location = useLocation();
  const { geminiResponse } = location.state || {}; // Destructure state, provide default empty object

  const { data, loading, error } = useLongevity({
    materials: [
      { name: "Cotton", pct: 65 },
      { name: "Polyester", pct: 25 },
      { name: "Elastane", pct: 10 }
    ],
    gsm: 180,
    weave: "Twill",
    stretchPct: 8,
    construction: { stitchesPerInch: 10, reinforcement: true },
    care: { method: "Machine", dryer: false, temp: "cold" },
    usage: { frequencyPerWeek: 2, activity: "casual" },
    reviews: { avgRating: 4.3, volume: 180 },
    price: 48
  });

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh"
      }}
    >
      <main style={{ display: "flex", justifyContent: "center" }}>
        <div className={styles.pieChartContainer}>
          <FabricChart fabricData={geminiResponse.materials} />
          {data && (
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <Scores
                lifeYears={data.lifeYears}
                ecoScore={data.ecoScore}
                qualityScore={data.qualityScore}
              />
            </div>
          )}
          {loading && <div style={{ marginTop: 16, textAlign: "center" }}>Calculating…</div>}
          {error && <div style={{ marginTop: 16, textAlign: "center", color: "#c33" }}>{error}</div>}
        </div>
      </main>
    </div>
  );
}
