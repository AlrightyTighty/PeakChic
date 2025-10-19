import { useLocation } from "react-router";
import s from "./Info.module.css";
import FabricChart from "../components/FabricChart";
import { useLongevity } from "../hooks/useLongevity";
import { useRef } from "react";
// import FabricChart from "../components/FabricChart";
// import React from "react";


/*type Props = {
    lifeYears?: number | string;
    ecoCost?: number | string;
    quality?: number | string;
    summary?: string;
    title?: string;
  };*/
  
  export default function RatingsPage() {

    const location = useLocation();
    const { geminiResponse } = location.state || {}; // Destructure state, provide default empty object

    const lifespanRef = useRef<HTMLParagraphElement | null>(null);
    const ecoScoreRef = useRef<HTMLParagraphElement | null>(null);
    const qualityRef = useRef<HTMLParagraphElement | null>(null);

    console.log(geminiResponse);

      const { data, loading, error } = useLongevity(
        geminiResponse
      );

      console.log(data)
      console.log(loading)
      console.log(error)

      const appearElement = (p: HTMLParagraphElement) => {
        // p.style.display = "block";
        console.log(p);
      }

      
      const hideElement = (p: HTMLParagraphElement) => {
      //  p.style.display = "none";
        console.log(p);
      }

    return (
<div className={s.panel}>
  <div className={s.header}>About Your Garment</div>

  <div className={s.chartCard}>
   { <FabricChart fabricData={geminiResponse.materials}  /> }
  </div>

  <div className={s.metrics}>
    <div onMouseEnter={ () => appearElement(lifespanRef.current!)} onMouseLeave={() => hideElement(lifespanRef.current!)} className={s.tile}>
      <div className={s.label}>Life (years)</div>
      <div className={s.value}>{data?.lifeYears}</div>
    </div>
    <div onMouseEnter={ () => appearElement(ecoScoreRef.current!)} onMouseLeave={() => hideElement(ecoScoreRef.current!)} className={s.tile}>
      <div className={s.label}>Eco-Cost</div>
      <div className={s.value}>{data?.ecoCostScore}</div>
    </div>
    <div onMouseEnter={ () => appearElement(qualityRef.current!)} onMouseLeave={() => hideElement(qualityRef.current!)}  className={s.tile}>
      <div className={s.label}>Quality</div>
      <div className={s.value}>{data?.qualityScore}</div>
    </div>
  </div>

  <div className={s.note}>{geminiResponse["wash-instructions"]}</div>
</div>

    );
  }