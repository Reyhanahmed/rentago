import {
  configureStore,
  AnyAction,
  ThunkAction,
  combineReducers,
  Reducer,
} from "@reduxjs/toolkit";

import AuthReducer, { logoutSuccess } from "./slices/auth";
import ApartmentReducer from "./slices/apartments";
import UserReducer from "./slices/users";

export const reducers = combineReducers({
  auth: AuthReducer,
  apartments: ApartmentReducer,
  users: UserReducer,
});

export type RootState = ReturnType<typeof reducers>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

const rootReducer: Reducer = (state: RootState, action: any) => {
  if (action.type === logoutSuccess.type) {
    state = {} as RootState;
  }

  return reducers(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});
