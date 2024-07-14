const express = require('express')
const connectToMongo = require('./mongo');
const app = express()
const port = 3000
connectToMongo();

app.use(express.json());

app.use('/api/auth', require('./routes/auth'))
app.use('/api/blogs', require('./routes/blogs'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})