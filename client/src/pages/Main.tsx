import styles from "./Main.module.css"
import mascot from "../assets/mascot.png"
import { useNavigate } from "react-router"


const Main = () => {

    const navigate = useNavigate();
  return (
    <main>
        <img id={styles['mascot-image']} src={mascot}/>
        <header>Vesta</header>
        <button onClick={() => navigate("/result")}>Scan Now</button>
    </main>
  )
}

export default Main;