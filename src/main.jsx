import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../src/assets/css/custom.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { DataCacheProvider } from "./contexts/DataCacheProvider.jsx";

createRoot(document.getElementById("root")).render(
  <div>
    <Provider store={store}>
      <DataCacheProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </DataCacheProvider>
    </Provider>
  </div>
);
