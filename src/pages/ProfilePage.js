import React, { useReducer, useEffect } from 'react'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { history } from '../App'
import {
  Input,
  Form,
  Dialog,
  Button,
  Tag,
  Tabs,
  Table,
  Icon,
  Card,
  Loading,
  Notification,
  Message,
} from 'element-react'
import Error from '../components/Error'
import { convertCentsToDollars } from '../utils'
import useForm from '../utils/useForm'
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

const ProfilePage = ({ user, userAttributes }) => {
  const initialState = {
    isLoading: true,
    isError: false,
    orders: [],
    columns: [
      { prop: 'name', width: '150' },
      { prop: 'value', width: '330' },
      {
        prop: 'tag',
        width: '150',
        render: row => {
          if (row.name === 'Email') {
            const emailVerified = userAttributes.email_verified
            return emailVerified ? (
              <Tag type="success">Verified</Tag>
            ) : (
              <Tag type="danger">Unverified</Tag>
            )
          }
        },
      },
      {
        prop: 'operations',
        render: row => {
          switch (row.name) {
            case 'Email':
              return (
                <Button
                  onClick={() => handleChange({ emailDialog: true })}
                  type="info"
                  size="small"
                >
                  Edit
                </Button>
              )
            case 'Delete Profile':
              return (
                <Button type="danger" size="small">
                  Delete
                </Button>
              )
            default:
              return
          }
        },
      },
    ],
  }
  const initialValues = {
    emailDialog: false,
    email: userAttributes.email,
    verificationForm: false,
    verificationCode: '',
  }
  const [state, dispatch] = useReducer(profilePageReducer, initialState)
  const { values, handleChange, handleSubmit } = useForm(initialValues)

  useEffect(() => {
    let isMounted = true

    const getUserOrders = async () => {
      if (isMounted) {
        dispatch({ type: FETCH_DATA_INIT })
      }
      try {
        const input = { id: userAttributes.sub }
        const result = await API.graphql(graphqlOperation(getUser, input))
        if (isMounted) {
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
  }, [userAttributes.sub])

  const sendVerificationCode = async attribute => {
    await Auth.verifyCurrentUserAttribute(attribute)
    Message({
      type: 'info',
      customClass: 'message',
      message: `Verification code sent to ${values.email}`,
    })
  }

  const handleUpdateEmail = async () => {
    try {
      handleChange({ verificationForm: true })
      const updatedAttributes = {
        email: values.email,
      }
      const result = await Auth.updateUserAttributes(user, updatedAttributes)
      if (result === 'SUCCESS') {
        sendVerificationCode('email')
      }
    } catch (error) {
      console.error(error)
      Notification.error({
        title: 'Error',
        message: `${error.message} || 'Error updating attribute'}`,
      })
    }
  }

  const handleVerifyEmail = async attribute => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attribute,
        values.verificationCode
      )
      Notification({
        title: 'Success',
        message: 'Email successfully verified',
        type: `${result.toLowerCase()}`,
        duration: 3000,
        onClose: () => {
          history.push('/profile')
        },
      })
    } catch (error) {
      console.error(error)
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error updating email'}`,
      })
    }
  }

  const { orders, columns, isLoading, isError } = state

  if (isLoading) return <Loading fullscreen={true} />
  if (isError) return <Error />
  return (
    userAttributes && (
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
            <Table
              columns={columns}
              data={[
                { name: 'Your Id', value: userAttributes.sub },
                { name: 'Username', value: user.username },
                { name: 'Email', value: userAttributes.email },
                { name: 'Phone Number', value: userAttributes.phone_number },
                { name: 'Delete Profile', value: 'Sorry to see you go' },
              ]}
              showHeader={false}
              rowClassName={row =>
                row.name === 'Delete Profile' && 'delete-profile'
              }
            />
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
                            {order.shippingAddress.city},
                            {order.shippingAddress.state},
                            {order.shippingAddress.country}
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
        {/* Email Dialog */}
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit Email"
          visible={values.emailDialog}
          onCancel={() => handleChange({ emailDialog: false })}
        >
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input
                  value={values.email}
                  onChange={email => handleChange({ email })}
                />
              </Form.Item>
              {values.verificationForm && (
                <Form.Item label="Enter Verification Code" labelWidth="120">
                  <Input
                    value={values.verificationCode}
                    onChange={verificationCode =>
                      handleChange({ verificationCode })
                    }
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => handleChange({ emailDialog: false })}>
              Cancel
            </Button>
            {!values.verificationForm && (
              <Button type="primary" onClick={() => handleUpdateEmail()}>
                Save
              </Button>
            )}
            {values.verificationForm && (
              <Button
                type="primary"
                onClick={event =>
                  handleSubmit(event, () => handleVerifyEmail('email'))
                }
              >
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    )
  )
}

export default ProfilePage
