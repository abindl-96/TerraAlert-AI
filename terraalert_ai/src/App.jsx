import { useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import theme from './theme'

import { BrowserRouter, Route, Routes, Navigate }from 'react-router-dom'
import Home from './Components/USER/Home'
import CompleteProfile from './Components/USER/CompleteProfile'
import Register from './Components/USER/Register'
import Login from './Components/USER/Login'
import SearchDestination from './Components/USER/SearchDestination'
import Notifications from './Components/USER/Notifications'
import RiskDashboard from './Components/USER/RiskDashboard'
import Dashboard from './Components/Admin/AdminComponents/Dashboard'
import DashboardLayout from './Components/Admin/AdminComponents/DashboardLayout'
import GovernmentDashboardLayout from './Components/Government/GovernmentDashboardLayout'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Navigate to="/Login" replace />}/>
            <Route path='/Login' element={<Login/>}/>
            <Route path='/Register' element={<Register/>}/>
            <Route path='/Home' element={<Home/>}/>
            <Route path='/CompleteProfile' element={<CompleteProfile/>}/>
            <Route path='/SearchDestination' element={<SearchDestination/>}/>
            <Route path='/Notifications' element={<Notifications/>}/>
            <Route path='/RiskDashboard' element={<RiskDashboard/>}/>
            <Route path='/dashboard' element={<DashboardLayout/>}/>
            <Route path='/government-dashboard' element={<GovernmentDashboardLayout/>}/>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App
