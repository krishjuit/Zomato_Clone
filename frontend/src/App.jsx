import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import LoginPopup from './components/LoginPopUp/LoginPopup'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Verify from './pages/Verify/verify'
import MyOrders from './pages/MyOrders/MyOrders'



const App = () => {

  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <>
      
      {/* Login Popup */}
      {showLogin && (
        <LoginPopup setShowLogin={setShowLogin} />
      )}

      {/* Main App */}
      <div className='app'>
        
        <Navbar setShowLogin={setShowLogin} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart/>} />
          {/* <Route path="/menu" element={<Menu />} /> */}
          {/* <Route path="/mobile-app" element={<MobileApp />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders/>}></Route>
        </Routes>

      </div>
    </>
  )
}

export default App