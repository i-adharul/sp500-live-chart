import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const productSlice = createSlice({
  name: 'product',
  initialState: {
    items: [],
    loading: false,
    error: {}
  },
  reducers: {
    setLoadingProduct: (state, action) => {
        state.loading = action.payload
    },
    getAllProducts: (state, action) => {
        state.items = [...action.payload]
    },
    setErrorProduct: (state, action) => {
        state.error = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { getAllProducts, setLoadingProduct, setErrorProduct } = productSlice.actions

export default productSlice.reducer

//async thunk
export function fetchData(someValue) {
    return (dispatch, getState) => { //currying
        async function fetchProducts() {
            try {
                dispatch(setLoadingProduct(true))
                const { data } = await axios.get('https://fakestoreapi.com/products')
                dispatch(getAllProducts(data))
            } catch(err) {
                console.log(err, "<< err")
                dispatch(setErrorProduct(err))
            } finally {
                dispatch(setLoadingProduct(false))
            }
        }
        fetchProducts()
    }
} 

