import React from "react";
import FabricChart from "./components/FabricChart";
import styles from "./App.module.css";

export default function App() {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >

      <main style={{ display: "flex", justifyContent: "center" }}>
        <div className={styles.pieChartContainer}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>
            Your Garment's Fabric Composition
          </h2>
          {/* Render the pie chart component */}
          <FabricChart />
        </div>
      </main>
    </div>
  );
}
