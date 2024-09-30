import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import {
  Outlet,
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Link,
} from '@tanstack/react-router';
import Home from './pages/Home';
import UploadedPage from './pages/UploadedPage';
import { Button } from './components/ui/button';

const rootRoute = createRootRoute({
  component: () => (
    <main className='min-h-screen flex flex-col'>
      <Header />
      <hr />
      <div className='flex-grow'>
        <Outlet />
      </div>
      <Footer/>
    </main>
  ), 
  notFoundComponent: () => ( 
    <div className='flex-grow'>
      <h1 className='mt-10'>This setting page doesn't exist!</h1> 
      <Button className='mt-10 text-white'><Link to="/" className='text-white'>Click here to go to home page.</Link></Button>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
});

const uploadedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/uploaded',
  component: () => <UploadedPage />,
});

const routeTree = rootRoute.addChildren([indexRoute, uploadedRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => <RouterProvider router={router} />;

export default App
