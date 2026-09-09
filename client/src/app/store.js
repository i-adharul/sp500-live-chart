import { configureStore } from '@reduxjs/toolkit';
import stocksReducer from '../features/stocks/stocksSlice';
import authReducer from '../features/auth/authSlice';
import watchlistReducer from '../features/watchlist/watchlistSlice';

export default configureStore({
  reducer: {
    stocks: stocksReducer,
    auth: authReducer,
    watchlist: watchlistReducer,
  },
});
