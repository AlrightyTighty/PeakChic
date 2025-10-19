import styles from "./Main.module.css"
import mascot from "../assets/mascot.png"
import Spinner from "../components/Spinner";
import { useRef, useState} from "react";
import { useNavigate } from "react-router"

const Main = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const errorText = useRef<null | HTMLParagraphElement>(null);

   const onClick = () => { chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const errorTextElement = errorText.current;
        if (!errorTextElement) return;

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

                const geminiResponseJson = await geminiResponse.json();
                if (geminiResponseJson.materials == null)
                {
                    errorTextElement.textContent = "Could not find material content. Make sure it is accessible on this page.";
                    return;
                }

                navigate("/result", { state: {geminiResponse: geminiResponseJson}});
            } catch (err: any) {
                errorTextElement.textContent = err
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
        <p ref={errorText} id={styles['error-text']}></p>
    </main>
  )
}

export default Main;