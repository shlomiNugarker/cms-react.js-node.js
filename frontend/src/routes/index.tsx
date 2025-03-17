import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '@/App';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ContentManagement from '@/pages/ContentManagement';
import ContentEditor from '@/pages/ContentEditor';
import PageForm from '@/pages/PageForm';
import PostForm from '@/pages/PostForm';
import ProductForm from '@/pages/ProductForm';
import MediaManager from '@/pages/MediaManager';
import SeoManagement from '@/pages/SeoManagement';
import SeoEdit from '@/pages/SeoEdit';
import AdminUsers from '@/pages/AdminUsers';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Unauthorized from '@/pages/Unauthorized';
import ScrollToTop from '@/components/ScrollToTop';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <ScrollToTop />
        <App />
      </>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'admin',
            element: <AdminUsers />,
          },
          {
            path: 'admin/users',
            element: <AdminUsers />,
          },
          {
            path: 'admin/content',
            element: <ContentManagement />,
          },
          {
            path: 'admin/content/new',
            element: <ContentEditor />,
          },
          {
            path: 'admin/content/edit/:id',
            element: <ContentEditor />,
          },
          {
            path: 'admin/page/new',
            element: <PageForm />,
          },
          {
            path: 'admin/page/edit/:id',
            element: <PageForm />,
          },
          {
            path: 'admin/post/new',
            element: <PostForm />,
          },
          {
            path: 'admin/post/edit/:id',
            element: <PostForm />,
          },
          {
            path: 'admin/product/new',
            element: <ProductForm />,
          },
          {
            path: 'admin/product/edit/:id',
            element: <ProductForm />,
          },
          {
            path: 'admin/media',
            element: <MediaManager />,
          },
          {
            path: 'admin/seo',
            element: <SeoManagement />,
          },
          {
            path: 'admin/seo/edit/:id',
            element: <SeoEdit />,
          },
        ],
      },
    ],
  },
]);

const Routes: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default Routes; 