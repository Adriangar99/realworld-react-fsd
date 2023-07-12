import { lazy } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { AuthGuard, GuestGuard } from '~entities/session';
// eslint-disable-next-line no-restricted-imports
import { articleRouteOpened } from '~pages/article/model';
import { MainLayout } from '~pages/layouts';
import { PATH_PAGE } from '~shared/lib/react-router';
import { Loadable } from '~shared/ui/loadable';

const ArticlePage = Loadable(lazy(() => import('~pages/article')));
const EditorPage = Loadable(lazy(() => import('~pages/editor')));
const HomePage = Loadable(lazy(() => import('~pages/home')));
const LoginPage = Loadable(lazy(() => import('~pages/login')));
const Page404 = Loadable(lazy(() => import('~pages/page-404')));
const ProfilePage = Loadable(lazy(() => import('~pages/profile')));
const RegisterPage = Loadable(lazy(() => import('~pages/register')));
const SettingsPage = Loadable(lazy(() => import('~pages/settings')));

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: PATH_PAGE.root,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: (
          <AuthGuard>
            <LoginPage />
          </AuthGuard>
        ),
      },
      {
        path: 'register',
        element: (
          <AuthGuard>
            <RegisterPage />
          </AuthGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <GuestGuard>
            <SettingsPage />
          </GuestGuard>
        ),
      },
      {
        path: 'editor',
        children: [
          {
            element: (
              <GuestGuard>
                <EditorPage />
              </GuestGuard>
            ),
            index: true,
          },
          {
            path: ':slug',
            element: (
              <GuestGuard>
                <EditorPage edit />
              </GuestGuard>
            ),
          },
        ],
      },
      {
        path: 'profile',
        children: [
          {
            element: <Navigate to={PATH_PAGE.page404} replace />,
            index: true,
          },
          { path: ':username', element: <ProfilePage /> },
          { path: ':username/favorites', element: <ProfilePage favorites /> },
        ],
      },
      {
        path: 'article',
        children: [
          {
            element: <Navigate to={PATH_PAGE.page404} replace />,
            index: true,
          },
          {
            path: ':slug',
            element: <ArticlePage />,
            loader: (args) => {
              const { slug } = args.params;

              if (slug) articleRouteOpened({ slug });

              return args;
            },
          },
        ],
      },
    ],
  },
  { path: '404', element: <Page404 /> },
  { path: '*', element: <Navigate to={PATH_PAGE.page404} replace /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
