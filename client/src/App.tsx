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
          {/* Render the pie chart component */}
          <FabricChart />
        </div>
      </main>
    </div>
  );
}
