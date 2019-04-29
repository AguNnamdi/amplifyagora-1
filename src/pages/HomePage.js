import React, { useState } from 'react'
import NewMarket from '../components/NewMarket'
import MarketList from '../components/MarketList'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearchChange = searchTerm => setSearchTerm(searchTerm)

  const handleClearSearch = searchTerm => {
    setSearchTerm('')
    setSearchResults([])
  }

  const handleSearch = event => {
    event.preventDefault()
    console.log('searchTerm: ', searchTerm)
  }

  return (
    <>
      <NewMarket
        searchTerm={searchTerm}
        isSearching={isSearching}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleSearch={handleSearch}
      />
      <MarketList />
    </>
  )
}

export default HomePage
