import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import durabilityRouter from '../routes/durability';

dotenv.config();

const app = express();
const port = 3000;

// Allow text/html (for Diffbot + Gemini parsing)
app.use(bodyParser.text({ type: 'text/html', limit: '100mb' }));

// Mount durability route
app.use('/api', durabilityRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/product_information', async (req, res) => {
  try {
    const body = req.body;
    const url = req.query.url as string;

    const diffbotResponse = await fetch(
      `https://api.diffbot.com/v3/product?token=${process.env.DIFFBOT_KEY}&url=${encodeURIComponent(url)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/html' },
        body: body,
      }
    );

    const parsedInfo = await diffbotResponse.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You will receive a blob of data from a webpage about a product. Please parse the information into this format:
    {
      "product-name": "name",
      "product-brand": "brand",
      "product-price": { "amount": 2.00, "currency": "USD" },
      "materials": [ { "material": "material-name", "percentage": 20.00 } ],
      "wash-instructions": "instructions"
    }
    Respond with plain stringified JSON only (no markdown, no code fences).
    If there are multiple products, only use the first.
    If data is missing, use null.
    Explain washing instructions without inventing details.
    Here is the data to parse: ${JSON.stringify(parsedInfo)}
    `;

    const geminiResponse = await model.generateContent(prompt);
    const text = geminiResponse.response.text();

    res.status(200).json(JSON.parse(text));
  } catch (e: any) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
