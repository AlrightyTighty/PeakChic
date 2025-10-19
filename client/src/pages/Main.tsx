import styles from "./Main.module.css"
import mascot from "../assets/mascot.png"


const Main = () => {
  return (
    <main>
        <img id={styles['mascot-image']} src={mascot}/>
        <header>Vesta</header>
        <button>Scan Now</button>
    </main>
  )
}

export default Main;