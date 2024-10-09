import "./index.css";
import "remixicon/fonts/remixicon.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";

const style = getComputedStyle(document.body);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <React.StrictMode>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 6,
            colorSplit: "rgba(5, 5, 5, 0.15)",
            colorBgBase: style.getPropertyValue("--primary-foreground"),
          },
        }}
      >
        <App />
      </ConfigProvider>
    </React.StrictMode>
  </BrowserRouter>,
);
