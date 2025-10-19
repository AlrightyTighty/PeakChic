import s from "./Info.module.css";
import FabricChart from "../components/FabricChart";
import React from "react";


type Props = {
    lifeYears?: number | string;
    ecoCost?: number | string;
    quality?: number | string;
    summary?: string;
    title?: string;
  };
  
  export default function RatingsPage({
    lifeYears = "~3",
    ecoCost = "4",
    quality = "9",
    summary = "Your garment is machine washable and should last with proper care. Click to view a detailed breakdown by material and construction.",
    title = "Ratings"
  }: Props) {
    return (
<div className={s.panel}>
  <div className={s.header}>Ratings</div>

  <div className={s.chartCard}>
    <FabricChart />
  </div>

  <div className={s.metrics}>
    <div className={s.tile}>
      <div className={s.label}>Life (years)</div>
      <div className={s.value}>{lifeYears}</div>
    </div>
    <div className={s.tile}>
      <div className={s.label}>Eco-costs</div>
      <div className={s.value}>{ecoCost}</div>
    </div>
    <div className={s.tile}>
      <div className={s.label}>Quality</div>
      <div className={s.value}>{quality}</div>
    </div>
  </div>

  <div className={s.note}>{summary}</div>
</div>

    );
  }