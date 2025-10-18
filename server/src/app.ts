import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/product_information', (req, res) => {
    const body = req.body;
    console.log(body);
    res.status(204);
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});