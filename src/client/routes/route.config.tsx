import React, { ReactElement } from "react";
import Login from "../pages/authentication/login.page";
import ResetPassword from "../pages/authentication/reset-password.page";
import { EmailTemplateListPage } from "../pages/template-management/email-template-list.page";

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
    path: "/",
    component: <></>,
  },
  {
    path: "/template",
    component: <></>,
    children: [
      {
        path: "email",
        component: <EmailTemplateListPage />,
        sideNav: {
          group: "Manage Template",
          displayName: "Email",
          icon: <i className="ri-mail-line"></i>,
        },
      },
      {
        path: "sms",
        component: <></>,
        sideNav: {
          group: "Manage Template",
          displayName: "SMS",
          icon: <i className="ri-message-line"></i>,
        },
      },
    ],
  },
];

export const publicRoutes: AppRoute[] = [
  { path: "/login", component: <Login /> },
  { path: "/password-change", component: <ResetPassword type={"sendLink"} /> },
  { path: "/first-time-login", component: <ResetPassword type={"sendLink"} /> },
  { path: "/reset-password", component: <ResetPassword type={"doReset"} /> },
];
