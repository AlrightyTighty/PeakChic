import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.text({type: "text/html", limit: '100mb'}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/product_information', async (req, res) => {
    const body = req.body;
    const url = req.query.url as string;

    // console.log(body);
    // console.log(url);

    const diffbotResponse = await fetch(`https://api.diffbot.com/v3/product?token=${process.env.DIFFBOT_KEY}&url=${encodeURIComponent(url)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "text/html",
            }, 
            body: body
        }
    )

    const parsedInfo = await diffbotResponse.json();

    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
    const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You will receive a blob of data from a webpage about a product. Please parse the information into the following format:
        {
            "product-name": "name",
            "product-brand": "brand",
            "product-price": {
            "amount": 2.00,
            "currency": "USD"
            },
            "materials": [
            {
                "material": "material-name",
                "percentage": 20.00
            }
            ],
            "wash-instructions": "instructions"
            }
        
        make sure your response is a stringified response. Do not respond with anything else. Do not use markdown, just give the plain text. If there are more than 1 product in the data you are sent, only choose the FIRST PRODUCT to parse.
        If you cannot find information, please do not make it up, just use null.
        Explain the washing instructions as well as you can without making up information.
        Here is the data to parse: ${JSON.stringify(parsedInfo)}`,
    });

    console.log(geminiResponse.text)

    res.json(JSON.parse(geminiResponse.text)).status(200).send();
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});