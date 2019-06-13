import React, { useReducer, useEffect } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
// prettier-ignore
import { Tabs, Icon, Card } from 'element-react'
import { convertCentsToDollars } from '../utils'
import {
  FETCH_DATA_INIT,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_FAILURE,
  RESET_USER_DATA,
} from '../utils/constants'

const getUser = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
    registered
    orders(sortDirection: DESC, limit: 999) {
      items {
        id
        createdAt
        product {
          id
          owner
          price
          createdAt
          description
        }
        shippingAddress {
          city
          country
          state
          address_line1
          address_zip
        }
      }
      nextToken
    }
  }
}
`
const profilePageReducer = (state, action) => {
  switch (action.type) {
    case FETCH_DATA_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isError: false,
        orders: action.payload.orders,
      }
    case FETCH_DATA_FAILURE:
      return { ...state, isLoading: false, isError: true }
    case RESET_USER_DATA:
      return state
    default:
      throw new Error()
  }
}

const ProfilePage = ({ user }) => {
  const initialState = {
    isLoading: true,
    isError: false,
    orders: [],
  }
  const [state, dispatch] = useReducer(profilePageReducer, initialState)

  useEffect(() => {
    let isMounted = true

    const getUserOrders = async () => {
      if (isMounted) {
        dispatch({ type: FETCH_DATA_INIT })
      }
      try {
        if (isMounted) {
          const input = { id: user.attributes.sub }
          const result = await API.graphql(graphqlOperation(getUser, input))
          dispatch({
            type: FETCH_DATA_SUCCESS,
            payload: { orders: result.data.getUser.orders.items },
          })
        }
      } catch (error) {
        dispatch({ type: FETCH_DATA_FAILURE })
      }
    }

    getUserOrders()

    return () => {
      isMounted = false
    }
  }, [user.attributes.sub])

  const { orders } = state
  return (
    user && (
      <>
        <Tabs activeName="1" className="profile-tabs">
          <Tabs.Pane
            label={
              <>
                <Icon name="document" className="icon" />
                Summary
              </>
            }
            name="1"
          >
            <h2 className="header">Profile Summary</h2>
          </Tabs.Pane>

          <Tabs.Pane
            label={
              <>
                <Icon name="message" className="icon" />
                Orders
              </>
            }
            name="2"
          >
            <h2 className="header">Order History</h2>

            {orders.map(order => (
              <div className="mb-1" key={order.id}>
                <Card>
                  <pre>
                    <p>Order Id: {order.id}</p>
                    <p>Product Description: {order.product.description}</p>
                    <p>Price: ${convertCentsToDollars(order.product.price)}</p>
                    <p>Purchased on {order.createdAt}</p>
                    {order.shippingAddress && (
                      <>
                        Shipping Address
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>
                            {order.shippingAddress.city},{' '}
                            {order.shippingAddress.state},{' '}
                            {order.shippingAddress.country}{' '}
                            {order.shippingAddress.address_zip}
                          </p>
                        </div>
                      </>
                    )}
                  </pre>
                </Card>
              </div>
            ))}
          </Tabs.Pane>
        </Tabs>
      </>
    )
  )
}

export default ProfilePage
