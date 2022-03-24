const express = require('express')
const bodyParser = require('body-parser')

const app = express()


const messages = []
const howManyMessagesAtOnce = 30

app.post('/message', bodyParser.json(), (req, res) => {
  // TODO: validate message
  messages.push(req.body)
  res.send('ok')
})

app.get('/messages', (req, res) => {
  // TODO: Make this more effecient with a better data structure design
  res.send(messages.filter(m =>
    (!req.query.newer || (m.timestamp > req.query.newer)) &&
      (!req.query.older || (m.timestamp < req.query.older))
  ).slice(-howManyMessagesAtOnce))
})

app.listen(5000, () => {
  console.log(`🔥🔥🔥 Blazel is running 🔥🔥🔥`)
})
