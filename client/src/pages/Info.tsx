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
      }

      
      const hideElement = (p: HTMLParagraphElement) => {
      //  p.style.display = "none";
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
      <div className={s.label}>Eco-Score</div>
      <div className={s.value}>{data?.ecoCostScore}</div>
    </div>
    <div onMouseEnter={ () => appearElement(qualityRef.current!)} onMouseLeave={() => hideElement(qualityRef.current!)}  className={s.tile}>
      <div className={s.label}>Quality</div>
      <div className={s.value}>{data?.qualityScore}</div>
    </div>
  </div>

  <div ref={lifespanRef} className={s.note}>The life prediction is based primarily on the materials and the care instruction. Synthetic materials that are washed warm or hot are more prone to degradation than natural materials that are washed cold.</div>
  <div ref={ecoScoreRef} className={s.note}>The eco score is based on the material used and whether it was imported. Certain materials, like polyester, are less friendly for the environment. Imported materials require more carbon emissions than locally-sourced materials for transport.</div>
  <div ref={qualityRef} className={s.note}>Quality is based on material composition and garment construction.</div>
</div>

    );
  }