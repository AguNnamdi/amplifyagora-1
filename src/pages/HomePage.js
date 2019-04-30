import React, { useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { searchMarkets } from '../graphql/queries'
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

  const handleSearch = async event => {
    try {
      event.preventDefault()
      setIsSearching(true)
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { owner: { match: searchTerm } },
              { tags: { match: searchTerm } },
            ],
          },
          sort: {
            field: 'createdAt',
            direction: 'desc',
          },
        })
      )
      console.log('{ result }: ', { result })
      setSearchResults(result.data.searchMarkets.items)
      setIsSearching(false)
    } catch (error) {
      console.error(error)
    }
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
      <MarketList searchResults={searchResults} searchTerm={searchTerm} />
    </>
  )
}

export default HomePage
