import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Stocks from './pages/Stocks'
import StockDetail from './pages/StockDetail'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
