import { useState, useEffect, useReducer } from 'react'
import { Auth, Hub } from 'aws-amplify'

const fetchUserDataReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_USER_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
    case 'FETCH_USER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        user: action.payload.user,
      }
    case 'FETCH_USER_FAILURE':
      return { ...state, isLoading: false, isError: true }
    case 'RESET_USER_AFTER_LOGOUT':
      return { ...state, user: null }
    default:
      throw new Error()
  }
}

const useFetchUserData = () => {
  const initialState = {
    isLoading: true,
    isError: false,
    user: null,
  }
  const [state, dispatch] = useReducer(fetchUserDataReducer, initialState)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      if (isMounted) {
        dispatch({ type: 'FETCH_USER_INIT' })
      }
      try {
        if (isMounted) {
          const data = await Auth.currentAuthenticatedUser()
          if (data) {
            dispatch({
              type: 'FETCH_USER_SUCCESS',
              payload: { user: data },
            })
          }
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ type: 'FETCH_USER_FAILURE' })
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
            setIsSignedIn(true)
            console.log('signed in')
          }
          break
        case 'signup':
          console.log('signed up')
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
  }, [isSignedIn])

  const handleSignout = async () => {
    try {
      console.log('signed out')
      await Auth.signOut()
      setIsSignedIn(false)
      dispatch({ type: 'RESET_USER_AFTER_LOGOUT' })
    } catch (error) {
      console.error('Error signing out user ', error)
    }
  }

  return { state, handleSignout }
}

export default useFetchUserData
