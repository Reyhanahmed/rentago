import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { customTheme } from "./theme";
import Routes from "./routes";
import { store } from "./redux";

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={customTheme} resetCSS={true}>
        <Routes />
        <ToastContainer />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
