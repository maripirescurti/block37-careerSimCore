import React, { useState } from 'react'
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Services from './components/Services.jsx';
import SingleService from './components/SingleService.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Account from './components/Account.jsx';
import { useEffect } from 'react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  return (
    <>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Services token={token}/>} />
        <Route path='/services/:id' element={<SingleService token={token} />} />
        <Route path='/login' element={<Login setToken={setToken} setEmail={setEmail}/>} />
        <Route path='/register' element={<Register setToken={setToken} />} />
        <Route path='/account' element={<Account token={token} />} />
      </Routes>
    </BrowserRouter>

    </>
  )
}
