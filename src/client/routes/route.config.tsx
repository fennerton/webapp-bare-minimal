import React, { ReactElement } from 'react';
import Login from "../pages/authentication/login.page";
import ResetPassword from "../pages/authentication/reset-password.page";

export type AppRoute = {
  path: string;
  sideNav?: {
    group: string;
    displayName: string;
    icon: ReactElement;
  };
  component?: ReactElement;
  canAccess?: () => boolean;
  children?: AppRoute[];
};

export const privateRoutes: AppRoute[] = [
  {
    path: '/',
    component: <></>,
  },
];

export const publicRoutes: AppRoute[] = [
  { path: '/login', component: <Login /> },
  { path: '/password-change', component: <ResetPassword type={'sendLink'} /> },
  { path: '/first-time-login', component: <ResetPassword type={'sendLink'} /> },
  { path: '/reset-password', component: <ResetPassword type={'doReset'} /> },
]