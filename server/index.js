const db = require('../db/index');
const express = require('express');
const app = express();
const PORT = 3000;
// const PUBLIC_DIR = path.join(__dirname, '')

app.use(express.json());
app.use(express.urlencoded());
app.use((req, res, next) => {
  console.log(`${req.method} incoming for ${req.url}`);
  next();
});

app.post('/api/reviews', db.postReview);
app.get('/api/reviews/:product_id', db.getAllReviewsById);
app.get('/api/reviews/meta/:product_id', db.getMeta);
app.get('/loaderio-5fefdaaadf9dbf656e0ea0c7f19e67b0.txt', (req, res) => {
  res.sendFile('/Users/luke82601/hrsea16/Reviews/server/loaderio-5fefdaaadf9dbf656e0ea0c7f19e67b0.txt');
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});