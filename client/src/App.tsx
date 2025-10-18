import React from "react";
import FabricChart from "./components/FabricChart";

export default function App() {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#333" }}>PeakChic Fabric Insight</h1>
        <p style={{ color: "#666" }}>
          Analyze the composition and quality of your clothing items
        </p>
      </header>

      <main style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            maxWidth: 400,
            width: "100%",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>
            Fabric Composition
          </h2>
          {/* Render the pie chart component */}
          <FabricChart />
        </div>
      </main>
    </div>
  );
}
