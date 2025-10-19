import styles from "./Scores.module.css";

type Props = {
  lifeYears: number;
  ecoCost: number;
  qualityScore: number;
};

export default function Scores({ lifeYears, ecoCost, qualityScore }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.value}>~{lifeYears}</div>
        <div className={styles.label}>Life</div>
        <div className={styles.sublabel}>(years)</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{Math.round(ecoCost)}</div>
        <div className={styles.label}>Eco-costs</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{Math.round(qualityScore)}</div>
        <div className={styles.label}>Quality</div>
      </div>
    </div>
  );
}
