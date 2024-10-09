import { Dropdown, message, Spin } from "antd";
import httpClient from "../utils/http-client.util";
import { Endpoint } from "../constants/endpoints.enum";
import React, { useState } from "react";
import { useBoundStore } from "../states/bound.store";

export const ApplicationHeader = () => {
  const [spinning, setSpinning] = useState(false);
  const user = useBoundStore().user;
  const userLogout = useBoundStore().userLogout;
  const displaySideNav = useBoundStore().displaySideNav;
  const sideNavToggle = useBoundStore().toggleSideNav;
  const setProactiveLoggingOut = useBoundStore().setProactiveLoggingOut;

  const copyValue = async (item: string, copyText: string) => {
    await navigator.clipboard.writeText(copyText);
    message.success(`${item} is copied!`);
  };

  function toggleSider() {
    sideNavToggle(!displaySideNav);
  }

  return (
    <>
      {user && (
        <div className="py-2 px-6 bg-primary-foreground flex items-center shadow-md shadow-black/5 sticky top-0 left-0 z-30">
          <button
            type="button"
            className="text-lg text-gray-900 font-semibold sidebar-toggle bg-transparent"
            onClick={toggleSider}
          >
            <i className="ri-menu-line"></i>
          </button>

          <ul className="ml-auto flex items-center">
            <li className="dropdown ml-3">
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    {
                      key: "0",
                      label: (
                        <span
                          role="menuitem"
                          title={"click to copy"}
                          className="flex items-center justify-between text-[14px] py-1.5 px-4"
                        >
                          <i className="ri-pass-valid-line me-3"></i>
                          <span>{user.staffId}</span>
                        </span>
                      ),
                      onClick: () => copyValue("staff id", user.staffId),
                    },
                    {
                      key: "1",
                      label: (
                        <span
                          role="menuitem"
                          title={"click to copy"}
                          className="flex items-center justify-between text-[14px] py-1.5 px-4"
                        >
                          <i className="ri-mail-line me-3"></i>
                          <span>{user.email}</span>
                        </span>
                      ),
                      onClick: () => copyValue("user email", user.email),
                    },
                    {
                      key: "2",
                      label: (
                        <span
                          role="menuitem"
                          className="flex items-center justify-end text-[14px] py-1.5 px-4 hover:text-[#f84525] cursor-pointer"
                        >
                          <span className="text-red-500">Log Out</span>
                          <i className="ri-logout-box-r-line ms-3 text-red-500"></i>
                        </span>
                      ),
                      onClick: async () => {
                        try {
                          setSpinning(true);
                          setProactiveLoggingOut(true);
                          await httpClient.post(Endpoint.LOGOUT);
                        } finally {
                          setTimeout(() => {
                            userLogout("/login");
                          }, 2000);
                        }
                      },
                    },
                  ],
                }}
              >
                <button
                  type="button"
                  className="dropdown-toggle flex items-center bg-transparent"
                >
                  <div className="flex-shrink-0 w-10 h-10 relative">
                    <div className="p-1 rounded-full focus:outline-none focus:ring">
                      <img
                        className="w-8 h-8 rounded-full"
                        src="https://laravelui.spruko.com/tailwind/ynex/build/assets/images/faces/9.jpg"
                        alt=""
                      />
                      <div className="top-0 left-7 absolute w-3 h-3 bg-lime-400 border-2 border-white rounded-full animate-ping"></div>
                      <div className="top-0 left-7 absolute w-3 h-3 bg-lime-500 border-2 border-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-2 md:block text-left">
                    <h2 className="text-sm font-semibold text-gray-800">
                      {user.name}
                    </h2>
                    <p className="text-xs text-gray-500">{user.role.name}</p>
                  </div>
                </button>
              </Dropdown>
            </li>
          </ul>
        </div>
      )}
      <Spin spinning={spinning} fullscreen />
    </>
  );
};
