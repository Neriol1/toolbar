import React from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Settings } from '../components/Settings';
import { Chat } from '../components/Chat';
import { Translate } from '../components/Translate';
import App from '@renderer/App';

const router = createHashRouter([
  { 
    path: '/', 
    element: <App />,
    children: [
      { path: '/settings', element: <Settings /> },
      { path: '/chat', element: <Chat /> },
      { path: '/translate', element: <Translate /> },
    ]
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router; 