import React from 'react'
import { Authenticator, AmplifyTheme } from 'aws-amplify-react'
import useFetchUserData from './components/helpers/useFetchUserData'
import './App.css'

function App() {
  const {
    data: { user },
  } = useFetchUserData()

  return !user ? <Authenticator theme={theme} /> : <div>App</div>
}

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: '#ffc0cb',
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'var(--amazonOrange)',
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: '5px',
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: 'var(--squidInk)',
  },
}

export default App
