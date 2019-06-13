import { useReducer, useState, useEffect } from 'react'
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify'
import { getUser } from '../graphql/queries'
import { registerUser } from '../graphql/mutations'
import {
  FETCH_DATA_INIT,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_FAILURE,
  RESET_USER_DATA,
} from './constants'

const amplifyAuthReducer = (state, action) => {
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
        user: action.payload.user,
      }
    case FETCH_DATA_FAILURE:
      return { ...state, isLoading: false, isError: true }
    case RESET_USER_DATA:
      return { ...state, user: null }
    default:
      throw new Error()
  }
}

const useAmplifyAuth = () => {
  const initialState = {
    isLoading: true,
    isError: false,
    user: null,
  }
  const [state, dispatch] = useReducer(amplifyAuthReducer, initialState)
  const [triggerFetch, setTriggerFetch] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      if (isMounted) {
        dispatch({ type: FETCH_DATA_INIT })
      }
      try {
        if (isMounted) {
          const data = await Auth.currentAuthenticatedUser()
          if (data) {
            dispatch({
              type: FETCH_DATA_SUCCESS,
              payload: { user: data },
            })
          }
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ type: FETCH_DATA_FAILURE })
        }
      }
    }

    const HubListener = () => {
      Hub.listen('auth', data => {
        const { payload } = data
        onAuthEvent(payload)
      })
    }

    const onAuthEvent = payload => {
      switch (payload.event) {
        case 'signIn':
          if (isMounted) {
            setTriggerFetch(true)
            registerNewUser(payload.data)
            console.log('signed in')
          }
          break
        default:
          return
      }
    }

    HubListener()
    fetchUserData()

    return () => {
      Hub.remove('auth')
      isMounted = false
    }
  }, [triggerFetch])

  const handleSignout = async () => {
    try {
      console.log('signed out')
      await Auth.signOut()
      setTriggerFetch(false)
      dispatch({ type: RESET_USER_DATA })
    } catch (error) {
      console.error('Error signing out user ', error)
    }
  }

  const registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    }
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput))
    // if user wasn't registered before, register them now
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        }
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        )
        console.log({ newUser })
      } catch (error) {
        console.error('Error registering new user', error)
      }
    }
  }

  return { state, handleSignout }
}

export default useAmplifyAuth
