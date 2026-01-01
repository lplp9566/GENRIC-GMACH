import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./Theme/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ToastContainer />
    <ThemeProvider>
      {/* <RtlThemeProvider> */}
      <App />
     {/* </RtlThemeProvider> */}
    </ThemeProvider>
      </Provider>
);
