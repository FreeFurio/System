import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../../assets/issalonlogo.jpg';
import infinityLogo from '../../assets/issalonnails.png';

const Layout = () => (
  <>
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>
      </div>
    </header>
    <main className="main">
      <Outlet />
    </main>
    <footer className="footer">
      <div className="footer-container">
        <div className="nail">
          <img src={infinityLogo} alt="infinitysalon" id="nails" />
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Terms & Condition</a>
          <a href="#" className="footer-link">Policy Privacy</a>
        </div>
      </div>
    </footer>
  </>
);

export default Layout;
