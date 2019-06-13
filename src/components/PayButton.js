import React from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { getUser } from '../graphql/queries'
import { createOrder } from '../graphql/mutations'
import StripeCheckout from 'react-stripe-checkout'
import { Notification, Message } from 'element-react'
import { history } from '../App'

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_nY7cLOmQWLKhsAq7bctsmJc900AnBWjeV0',
}

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async ownerId => {
    try {
      const input = { id: ownerId }
      const result = await API.graphql(graphqlOperation(getUser, input))
      return result.data.getUser.email
    } catch (error) {
      console.error(`Error fetching product owner's email: `, error)
    }
  }

  const createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    state: source.address_state,
    address_line1: source.address_line1,
    address_zip: source.address_zip,
  })

  const handleCharge = async token => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner)
      const result = await API.post('orderlambda', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            ownerEmail,
            shipped: product.shipped,
          },
        },
      })
      console.log({ result })
      if ((result.charge.status = 'succeeded')) {
        let shippingAddress = null
        if (product.shipped) {
          shippingAddress = createShippingAddress(result.charge.source)
        }
        const input = {
          orderUserId: user.attributes.sub,
          orderProductId: product.id,
          shippingAddress,
        }
        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        )
        console.log({ order })
        Notification({
          title: 'Success',
          message: `${result.message}`,
          type: 'success',
          duration: 3000,
          onClose: () => {
            history.push('/')
            Message({
              type: 'info',
              message: 'Check your email for details.',
              duration: 5000,
              showClose: true,
            })
          },
        })
      }
    } catch (error) {
      console.error(error)
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error processing order'}`,
      })
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
