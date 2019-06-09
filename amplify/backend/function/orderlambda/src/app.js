require('dotenv').config()
var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
var AWS = require('aws-sdk')

const config = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'eu-west-1',
  adminEmail: 'Baccerst34@fleckens.hu',
}

var ses = new AWS.SES(config)

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

const chargeHandler = async (req, res, next) => {
  const { token } = req.body
  const { currency, amount, description } = req.body.charge

  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    })
    if (charge.status === 'succeeded') {
      req.charge = charge
      req.description = description
      req.email = req.body.email
      next()
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

const convertCentsToDollars = price => (price / 100).toFixed(2)

const emailHandler = (req, res) => {
  const {
    charge,
    description,
    email: { shipped, customerEmail, ownerEmail },
  } = req

  ses.sendEmail(
    {
      Source: config.adminEmail,
      ReturnPath: config.adminEmail,
      Destination: {
        ToAddresses: [config.adminEmail],
      },
      Message: {
        Subject: {
          Data: 'Order Details - Amplifyagora',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h3> Order Processed!</h3
            <p><span style="font-weight: bold">${description}</span> - USD ${convertCentsToDollars(
              charge.amount
            )}</p>
            <p>Customer Email: <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p>Contact your seller: <a href="mailto:${ownerEmail}">${ownerEmail}</a></p>
            ${
              shipped
                ? `<h4>Mailing Address</h4>
                <p>${charge.source.name}</p>
                <p>${charge.source.address_line1}</p>
                <p>${charge.source.address.city}, ${
                    charge.source.address.state
                  }, ${charge.source.adress_zip}</p>
                `
                : 'Emailed product'
            }
            <p style="font-style: italic; color: grey;>${
              shipped
                ? 'Your product will be shipped in 2-3 days'
                : 'Check your verified email for your product'
            }</p>`,
          },
        },
      },
    },
    (error, data) => {
      if (error) {
        return res.status(500).json({ error })
      }
      res.json({
        message: 'Order processed successfully!',
        charge,
        data,
      })
    }
  )
}

app.post('/charge', chargeHandler, emailHandler)

app.listen(3000, function() {
  console.log('App started')
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
