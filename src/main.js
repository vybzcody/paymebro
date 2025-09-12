import { jsx as _jsx } from "react/jsx-runtime";
import "./index.css";
import ReactDOM from "react-dom/client";
// IMP START - Setup Web3Auth Provider
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./web3authContext";
// IMP END - Setup Web3Auth Provider
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")).render(
// IMP START - Setup Web3Auth Provider
_jsx(Web3AuthProvider, { config: web3AuthContextConfig, children: _jsx(App, {}) })
// IMP END - Setup Web3Auth Provider
);
