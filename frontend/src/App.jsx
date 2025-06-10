import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/comman/Navbar'
import Home from './pages/Home'
import Footer from './components/comman/Footer'
import Shop from './pages/Shop'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import ShopComponent from './pages/Demo'
import ProductDetail from './pages/Demo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen flex flex-col overflow-x-hidden'>
       <Navbar />
  
  <main className="flex-1 w-full mt-10">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/demopage/:id" element={<ShopComponent />} />
      <Route path="/shop/:id" element={<ProductDetail />} />
    </Routes>
  </main>
  
  <Footer />
</div>
  )
}

export default App
