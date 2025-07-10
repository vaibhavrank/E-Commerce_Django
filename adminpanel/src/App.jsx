import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home'
import Navbar from './compoenents/comman/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='bg-black'>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />

      </Routes>
    </div>
  )
}

export default App
