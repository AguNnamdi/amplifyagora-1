import { useState, useEffect } from 'react'
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify'
import { getUser } from '../../graphql/queries'
import { registerUser } from '../../graphql/mutations'

const useFetchUserData = () => {
  const [user, setUser] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchUserData = async () => {
      try {
        const data = await Auth.currentAuthenticatedUser()
        if (mounted) {
          data ? setUser(data) : setUser(null)
        }
      } catch (error) {
        console.error(error)
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
          if (mounted) {
            setIsSignedIn(true)
            registerNewUser(payload.data)
            console.log('signed in')
          }
          break
        case 'signup':
          console.log('signed up')
          break
        case 'signout':
          if (mounted) {
            setIsSignedIn(false)
            console.log('signed out')
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
      mounted = false
    }
  }, [isSignedIn])

  const handleSignout = async () => {
    try {
      await Auth.signOut()
      setUser(null)
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

  return { user, handleSignout }
}

export default useFetchUserData
