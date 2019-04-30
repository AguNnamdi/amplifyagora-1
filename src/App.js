import React from 'react'
import { Authenticator, AmplifyTheme } from 'aws-amplify-react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MarketPage from './pages/MarketPage'
import Navbar from './components/Navbar'
import useFetchUserData from './components/helpers/useFetchUserData'
import './App.css'

export const UserContext = React.createContext()

const App = () => {
  const { user, handleSignout } = useFetchUserData()

  return !user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ user }}>
      <Router>
        <>
          {/* Navigation*/}
          <Navbar user={user} handleSignout={handleSignout} />
          {/* Routes */}
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route
              path="/markets/:marketId"
              component={({ match }) => (
                <MarketPage marketId={match.params.marketId} />
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
