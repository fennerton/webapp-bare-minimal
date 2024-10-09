import { privateRoutes, AppRoute } from '../routes/route.config';
import { Outlet, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../pages/4xx/404.page';

export const ApplicationContent = () => {
  const constructRoute = (route: AppRoute) => {
    const canActive = route.canAccess ? route.canAccess : () => true;
    if (canActive()) {
      return (
        <Route key={route.path} path={route.path}
               element={
                 <div>
                   {route.component}
                   {(route.children && route.children.length) ? <Outlet /> : <></>}
                 </div>
               }>
          {
            route.children && route.children.map(constructRoute)
          }
        </Route>
      );
    }
  };

  return (
    <div className={'p-6 flex-grow-[1]'}>
      <Routes>
        {
          privateRoutes.map(constructRoute)
        }
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </div>

  );
};