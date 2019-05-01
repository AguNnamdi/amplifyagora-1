import { useState, useEffect } from 'react'
import { Auth, Hub } from 'aws-amplify'

const useFetchUserData = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let didCancel = false

    const fetchUserData = async () => {
      try {
        const data = await Auth.currentAuthenticatedUser()
        if (!didCancel) {
          data ? setUser(data) : setUser(null)
        }
      } catch (error) {
        if (!didCancel) {
          console.error(error)
        }
      }
    }
    fetchUserData()
    return () => {
      didCancel = true
    }
  }, [])

  useEffect(() => {
    let didCancel = true

    const HubListener = () => {
      Hub.listen('auth', data => {
        const { payload } = data
        if (!didCancel) {
          onAuthEvent(payload)
        }
      })
    }
    HubListener()
    return () => {
      Hub.remove('auth')
      didCancel = true
    }
  }, [])

  const onAuthEvent = payload => {
    switch (payload.event) {
      case 'signIn':
        console.log('signed in')
        break
      case 'signup':
        console.log('signed up')
        break
      case 'signout':
        console.log('signed out')
        break
      default:
        return
    }
  }

  const handleSignout = async () => {
    try {
      await Auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out user ', error)
    }
  }

  return { user, handleSignout }
}

export default useFetchUserData
