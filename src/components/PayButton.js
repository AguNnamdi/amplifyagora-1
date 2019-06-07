import React from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import StripeCheckout from 'react-stripe-checkout'

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_nY7cLOmQWLKhsAq7bctsmJc900AnBWjeV0',
}

const PayButton = ({ product, user }) => {
  const handleCharge = async token => {
    try {
      const result = await API.post('orderlambda', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
        },
      })
      console.log({ result })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  )
}

export default PayButton
