import styles from "./Main.module.css"
import mascot from "../assets/mascot.png"
// import { useNavigate } from "react-router"

const Main = () => {

    // const navigate = useNavigate();

   const onClick = () => { chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_PAGE_HTML" },
            async (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            } else {
                const html = response.html;
                console.log(html);
                const geminiResponse = await fetch(`http://localhost:3000/api/product_information?url=${encodeURIComponent(tabs[0].url!)}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "text/html"
                        },
                        body: html

                    }
                )

                console.log(await geminiResponse.json());
            }
            }
        );
        }
    });}
    
  return (
    <main>
        <img id={styles['mascot-image']} src={mascot}/>
        <header>Vesta</header>
        <button onClick={onClick}>Scan Now</button>
    </main>
  )
}

export default Main;