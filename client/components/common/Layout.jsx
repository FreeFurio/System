import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../../assets/infinitylogo.png';
import issalonNails from '../../assets/issalonnails.png';

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
          <img src={issalonNails} alt="issalonnails" id="nails" style={{ maxWidth: '120px', width: '100%', height: 'auto' }} />
        </div>
      </div>
    </footer>
  </>
);

export default Layout;
