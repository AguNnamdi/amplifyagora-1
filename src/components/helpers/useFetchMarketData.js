import { useEffect, useReducer } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { getMarket } from '../../graphql/queries'
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
} from '../../graphql/subscriptions'

const useFetchMarketData = ({ marketId, user }) => {
  const [state, dispatch] = useReducer(reducer, {
    isLoading: true,
    isError: false,
    market: {},
    isMarketOwner: false,
  })

  function reducer(state, action) {
    switch (action.type) {
      case 'FETCH_MARKET_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        }
      case 'FETCH_MARKET_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          market: action.payload,
          isMarketOwner: user.username === action.payload.owner,
        }
      case 'FETCH_MARKET_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        }
      case 'FETCH_PRODUCTS':
        return {
          ...state,
          market: action.payload,
        }
      default:
        throw new Error()
    }
  }

  useEffect(() => {
    let mounted = true

    const fetchMarket = async () => {
      if (mounted) {
        dispatch({ type: 'FETCH_MARKET_INIT' })
      }
      try {
        if (mounted) {
          const input = { id: marketId }
          const result = await API.graphql(graphqlOperation(getMarket, input))
          dispatch({
            type: 'FETCH_MARKET_SUCCESS',
            payload: result.data.getMarket,
          })
        }
      } catch (error) {
        if (mounted) {
          dispatch({ type: 'FETCH_MARKET_FAILURE' })
        }
      }
    }

    fetchMarket()

    return () => (mounted = false)
  }, [marketId])

  useEffect(() => {
    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct)
    ).subscribe({
      next: productData => {
        const createdItem = productData.value.data.onCreateProduct
        const prevItems = state.market.products.items.filter(
          item => item.id !== createdItem.id
        )
        const updatedItems = [createdItem, ...prevItems]
        let updatedMarket = { ...state.market }
        updatedMarket.products.items = updatedItems
        dispatch({ type: 'FETCH_PRODUCTS', payload: updatedMarket })
      },
    })

    const updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct)
    ).subscribe({
      next: productData => {
        const updatedItem = productData.value.data.onUpdateProduct
        const updatedItemIndex = state.market.products.items.findIndex(
          item => item.id === updatedItem.id
        )
        const updatedItems = [
          ...state.market.products.items.slice(0, updatedItemIndex),
          updatedItem,
          ...state.market.products.items.slice(updatedItemIndex + 1),
        ]
        let updatedMarket = { ...state.market }
        updatedMarket.products.items = updatedItems
        dispatch({ type: 'FETCH_PRODUCTS', payload: updatedMarket })
      },
    })

    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct)
    ).subscribe({
      next: productData => {
        const deletedItem = productData.value.data.onDeleteProduct
        const updatedItems = state.market.products.items.filter(
          item => item.id !== deletedItem.id
        )
        let updatedMarket = { ...state.market }
        updatedMarket.products.items = updatedItems
        dispatch({ type: 'FETCH_PRODUCTS', payload: updatedMarket })
      },
    })
    return () => {
      createProductListener.unsubscribe()
      updateProductListener.unsubscribe()
      deleteProductListener.unsubscribe()
    }
  }, [state])

  return { ...state }
}

export default useFetchMarketData
