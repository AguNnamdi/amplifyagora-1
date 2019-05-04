import { useState, useEffect } from 'react'
import { Auth, Hub } from 'aws-amplify'

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
      setIsSignedIn(false)
      setUser(null)
    } catch (error) {
      console.error('Error signing out user ', error)
    }
  }

  return { user, handleSignout }
}

export default useFetchUserData
