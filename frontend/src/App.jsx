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
import Demo from './pages/Demo'
import PrivateRoutes from './components/comman/PrivateRoutes'
import Dashboard from './pages/Dashboard'
import Cart from './components/core/Dashboard/Cart'
import Orders from './components/core/Dashboard/Orders'
import Address from './components/core/Dashboard/Address'
import Logout from './components/comman/Logout'
import ThriftShopPages from './pages/NewIns'
// import Demo2 from './pages/Demo2'

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
      <Route path="/newins" element={<ThriftShopPages />} />
      
      {/* <Route path="/demopage" element={<Demo2 />} /> */}
      <Route path="/shop/:id" element={<Demo />} />

      <Route path="/dashboard" element={<PrivateRoutes />}>
        <Route element={<Dashboard />}>
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/cart" element={<Cart />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/dashboard/address" element={<Address />} />
          <Route path="/dashboard/logout" element={<Logout />} />
        </Route>
      </Route>
    </Routes>
  </main>
  
  
</div>
  )
}

export default App
