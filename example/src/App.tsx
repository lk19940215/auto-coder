import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

const App: React.FC = () => {
  return (
    <div id="app" className="dark min-h-screen bg-[var(--bg-100)]">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
