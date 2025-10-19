import styles from "./Main.module.css"
import mascot from "../assets/mascot.png"
import Spinner from "../components/Spinner";
import { useState} from "react";
import { useNavigate } from "react-router"

const Main = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

   const onClick = () => { chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        setLoading(true);

        if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_PAGE_HTML" },
            async (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                setLoading(false);
                return;
            } 
            try {
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

                navigate("/rating", { state: {geminiResponse: await geminiResponse.json()}});
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
            }
        );
        }
    });}
    
  return (
    <main>
        <img id={styles['mascot-image']} src={mascot}/>
        <header>Vesta</header>
        {loading ? (
            <Spinner />
        ) : (   
            <button onClick={onClick}>SCAN</button>
        )}
    </main>
  )
}

export default Main;