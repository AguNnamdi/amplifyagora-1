import { useEffect, useReducer } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { getMarket } from '../../graphql/queries'

export default function useFetchMarketData({ marketId, user }) {
  const [state, dispatch] = useReducer(marketFetchReducer, {
    isLoading: true,
    isError: false,
    market: null,
    isMarketOwner: false,
  })

  function marketFetchReducer(state, action) {
    switch (action.type) {
      case 'FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        }
      case 'FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          market: action.payload,
          isMarketOwner: user.username === action.payload.owner,
        }
      case 'FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        }
      default:
        throw new Error()
    }
  }

  useEffect(() => {
    const fetchMarket = async () => {
      dispatch({ type: 'FETCH_INIT' })
      try {
        const input = { id: marketId }
        const result = await API.graphql(graphqlOperation(getMarket, input))
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: result.data.getMarket,
        })
      } catch (error) {
        dispatch({ type: 'FETCH_FAILURE' })
      }
    }
    fetchMarket()
  }, [dispatch, marketId])

  return { ...state }
}
