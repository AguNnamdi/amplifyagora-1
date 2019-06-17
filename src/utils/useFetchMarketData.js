import { useEffect, useReducer } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
} from '../graphql/subscriptions'
import {
  FETCH_DATA_INIT,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_FAILURE,
  FETCH_PRODUCTS,
} from './constants'

const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products (sortDirection: DESC, limit: 999) {
      items {
        id
        description
        market {
          id
          name
          tags
          owner
          createdAt
        }
        file {
          bucket
          region
          key
        }
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`
const fetchMarketReducer = (state, action) => {
  switch (action.type) {
    case FETCH_DATA_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isError: false,
        market: action.payload.market,
        isMarketOwner: action.payload.isMarketOwner,
      }
    case FETCH_DATA_FAILURE:
      return { ...state, isLoading: false, isError: true }
    case FETCH_PRODUCTS:
      return {
        ...state,
        market: action.payload,
      }
    default:
      throw new Error()
  }
}

const useFetchMarketData = ({ user, userAttributes, marketId }) => {
  const initialState = {
    isLoading: true,
    isError: false,
    market: {},
    isMarketOwner: false,
    isEmailVerified: userAttributes.email_verified,
  }
  const [state, dispatch] = useReducer(fetchMarketReducer, initialState)

  useEffect(() => {
    let isMounted = true

    const fetchMarket = async () => {
      if (isMounted) {
        dispatch({ type: FETCH_DATA_INIT })
      }
      try {
        const input = { id: marketId }
        const result = await API.graphql(graphqlOperation(getMarket, input))
        const isMarketOwner = user.username === result.data.getMarket.owner

        if (isMounted) {
          dispatch({
            type: FETCH_DATA_SUCCESS,
            payload: {
              market: result.data.getMarket,
              isMarketOwner,
            },
          })
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ type: FETCH_DATA_FAILURE })
        }
      }
    }

    fetchMarket()

    return () => {
      isMounted = false
    }
  }, [marketId, user.username, userAttributes])

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
        dispatch({ type: FETCH_PRODUCTS, payload: updatedMarket })
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
  }, [state.market])

  return state
}

export default useFetchMarketData
