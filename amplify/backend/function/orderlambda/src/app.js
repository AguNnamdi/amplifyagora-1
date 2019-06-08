var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.post('/charge', async (req, res) => {
  const { token } = req.body
  const { currency, amount, description } = req.body.charge

  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    })
    res.json(charge)
  } catch (error) {
    res.status(500).json({ error })
  }
})

app.post('/charge/*', function(req, res) {
  // Add your code here
  res.json({ success: 'post call succeed!', url: req.url, body: req.body })
})

app.listen(3000, function() {
  console.log('App started')
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
