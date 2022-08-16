import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Route, Router } from "react-router";

interface RenderProps {
  initialState?: any;
  reducer?: any;
  renderOptions?: RenderOptions;
}

const history = createMemoryHistory();

const renderWithProviders = (
  ui: React.ComponentType,
  { initialState = {}, reducer, ...renderOptions }: RenderProps = {}
) => {
  const Wrapper: React.ComponentType<{
    children?: React.ReactNode;
  }> = ({ children }) => (
    <Provider
      store={configureStore({
        reducer: combineReducers(reducer),
        preloadedState: initialState,
      })}
    >
      <Router history={history}>{children}</Router>
    </Provider>
  );

  return render(<Route component={ui} />, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

export { renderWithProviders, history };
