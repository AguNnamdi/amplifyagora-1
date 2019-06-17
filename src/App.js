import React from 'react'
import { Authenticator, AmplifyTheme } from 'aws-amplify-react'
import { Router, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MarketPage from './pages/MarketPage'
import Navbar from './components/Navbar'
import useAmplifyAuth from './utils/useAmplifyAuth'
import './App.css'

export const history = createBrowserHistory()

export const UserContext = React.createContext()

const App = () => {
  const {
    state: { user, userAttributes },
    handleSignout,
  } = useAmplifyAuth()

  return !user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ userAttributes }}>
      <Router history={history}>
        <>
          {/* Navigation*/}
          <Navbar user={user} handleSignout={handleSignout} />
          {/* Routes */}
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route
              path="/profile"
              render={props => (
                <ProfilePage
                  {...props}
                  user={user}
                  userAttributes={userAttributes}
                />
              )}
            />
            <Route
              path="/markets/:marketId"
              render={props => (
                <MarketPage
                  {...props}
                  user={user}
                  userAttributes={userAttributes}
                  marketId={props.match.params.marketId}
                />
              )}
            />
          </div>
        </>
      </Router>
    </UserContext.Provider>
  )
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
