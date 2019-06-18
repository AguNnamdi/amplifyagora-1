import React, { useReducer, useEffect } from 'react'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { updateUser } from '../graphql/mutations'
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
  MessageBox,
} from 'element-react'
import Error from '../components/Error'
import { convertCentsToDollars, formatOrderDate } from '../utils'
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
                <Button
                  type="danger"
                  size="small"
                  onClick={handleDeleteProfile}
                >
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

  const handleDeleteProfile = () => {
    MessageBox.confirm(
      'This will permanently delete your account! Continue?',
      'Attention!',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
      .then(async () => {
        try {
          await user.deleteUser(() =>
            Notification({
              title: 'Success',
              message: 'Profile successfully deleted',
              type: 'success',
              duration: 1000,
              onClose: () => {
                window.location = '/'
                window.location.reload()
              },
            })
          )
        } catch (error) {
          console.error(error)
        }
      })
      .catch(() => {
        Message({
          type: 'info',
          message: 'Delete Profile cancelled',
        })
      })
  }

  const handleUpdateEmail = async () => {
    try {
      handleChange({ verificationForm: true })
      const updatedAttributes = {
        email: values.email,
      }
      await Auth.updateUserAttributes(user, updatedAttributes)
      Message({
        type: 'info',
        customClass: 'message',
        message: `Verification code sent to ${values.email}`,
      })
    } catch (error) {
      console.error(error)
      Notification.error({
        title: 'Error',
        message: `${error.message} || 'Error updating attribute'}`,
      })
    }
  }

  const handleVerifyEmail = async attribute => {
    // verify code against Amazon Cognito User
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attribute,
        values.verificationCode
      )
      // update user email in Amazon Dynamo DB
      if (result === 'SUCCESS') {
        try {
          const input = { id: userAttributes.sub, email: values.email }
          await API.graphql(graphqlOperation(updateUser, { input }))
        } catch (error) {
          console.error(error)
          Notification.error({
            title: 'Error',
            message: `${error.message || 'Error updating email'}`,
          })
        }
      }
      Notification({
        title: 'Success',
        message: 'Email successfully verified',
        type: `${result.toLowerCase()}`,
        duration: 3000,
        onClose: () => {
          window.locaticon.reload()
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
                    <p>Purchased on {formatOrderDate(order.createdAt)}</p>
                    {order.shippingAddress && (
                      <>
                        Shipping Address
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>
                            {order.shippingAddress.address_zip}{' '}
                            {order.shippingAddress.city},{' '}
                            {order.shippingAddress.state},{' '}
                            {order.shippingAddress.country}
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
