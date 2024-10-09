import React, { useEffect, useState } from 'react';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import httpClient from './utils/http-client.util';
import { Endpoint } from './constants/endpoints.enum';
import { SideNavigation } from './layout/side-navigation.layout';
import { ApplicationHeader } from './layout/application-header.layout';
import { ApplicationContent } from './layout/application-content.layout';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useBoundStore } from './states/bound.store';
import {publicRoutes} from "./routes/route.config";

dayjs.extend(utc);
dayjs.extend(timezone);

function App() {
    const displaySideNav = useBoundStore().displaySideNav;

    const location = useLocation();

    const [authenticated, setAuthenticated] = useState(false);


    useEffect(() => {
        //liveCheck();
    }, [location]);

    const liveCheck = async () => {
        if (publicRoutes.map((pr) => pr.path).includes(location.pathname)) {
            return;
        }

        try {
            await httpClient.post(Endpoint.PING);
            setAuthenticated(true);
        } catch (e) {
            setAuthenticated(false);
        }
    };

    return (
      <div className="App">
          <Routes>
              {publicRoutes.map((route, i) => (
                <Route key={i} path={route.path} element={route.component} />
              ))}
          </Routes>
          {authenticated && (
            <>
                <SideNavigation />
                <main
                  className={`w-full flex flex-col md:w-[calc(100%-256px)] md:ml-64 bg-gray-200 min-h-screen transition-all ${displaySideNav ? '' : 'active'}`}
                >
                    <ApplicationHeader />
                    <ApplicationContent />
                </main>
            </>
          )}
      </div>
    );
}

export default App;