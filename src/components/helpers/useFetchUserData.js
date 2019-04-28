import { useState, useEffect } from 'react'
import { Auth, Hub } from 'aws-amplify'

const useFetchUserData = () => {
  const [data, setData] = useState({ user: null })
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser()
        user ? setData({ user }) : setData({ user: null })
      } catch (error) {
        console.error(error)
      }
    }
    fetchUserData()
  }, [isSignedIn])

  useEffect(() => {
    const HubListener = () => {
      Hub.listen('auth', data => {
        const { payload } = data
        onAuthEvent(payload)
      })
    }
    HubListener()
    return Hub.remove('auth')
  }, [])

  const onAuthEvent = payload => {
    switch (payload.event) {
      case 'signIn':
        console.log('signed in')
        setIsSignedIn(true)
        break
      case 'signup':
        console.log('signed up')
        break
      case 'signout':
        console.log('signed out')
        setData({ user: null })
        break
      default:
        return
    }
  }

  const handleSignout = async () => {
    try {
      await Auth.signOut()
      setData({ user: null })
    } catch (error) {
      console.error('Error signing out user ', error)
    }
  }

  return { data, handleSignout }
}

export default useFetchUserData
