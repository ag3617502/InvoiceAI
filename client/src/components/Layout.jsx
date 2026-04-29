import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 md:p-12 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
