// frontend/src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import FeedbackButton from './FeedbackButton';

export default function MainLayout() {
  return (
    <>
      <Sidebar />
      <main>
        <Outlet /> 
      </main>
      <FeedbackButton />
    </>
  );
}