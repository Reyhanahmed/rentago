import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  ApiStatus,
  ErrorDataType,
  Response,
  User,
  UserCredentials,
} from "../../types";
import { httpClient } from "../../utils/httpClient";
import { isInternalError } from "../../utils/isInternalError";
import { showError, showSuccess } from "../../utils/toast";
import { AppThunk } from "..";

interface IAuthState {
  status: ApiStatus;
  isAuthenticated: boolean;
  data: User | null;
  error?: ErrorDataType | null;
}

const initialState: IAuthState = {
  status: "idle",
  isAuthenticated: false,
  data: null,
  error: null,
};

const pending = (state: IAuthState) => {
  state.status = "pending";
};

const success = (state: IAuthState, action: PayloadAction<User>) => {
  state.status = "resolved";
  state.isAuthenticated = true;
  state.data = action.payload;
};

const fail = (state: IAuthState, action: PayloadAction<ErrorDataType>) => {
  state.status = "rejected";
  state.isAuthenticated = false;
  state.error = action.payload;
};

const profileUpdateSuccess = (
  state: IAuthState,
  action: PayloadAction<User>
) => {
  state.data = { ...state.data, ...action.payload };
};

export const logoutSuccess = createAction("logout/success");

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: pending,
    authSuccess: success,
    authFail: fail,
    updateProfileSuccess: profileUpdateSuccess,
  },
});

const authenticate =
  (data: UserCredentials, endpoint: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(authStart());

      const res: Response<User> = await httpClient.post(endpoint, {
        data,
      });

      if (res.status === "fail") {
        if (typeof res.data[0] === "string") {
          showError(res.data[0]);
        } else {
          showError("Please fix the errors below");
        }
        return dispatch(authFail(res.data));
      }

      dispatch(authSuccess(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
        dispatch(authFail([error.message]));
      }
    }
  };

export const signin =
  ({ email, password }: UserCredentials): AppThunk =>
  async (dispatch) => {
    dispatch(authenticate({ email, password }, "/auth/signin"));
  };

export const signup =
  (signupPayload: UserCredentials): AppThunk =>
  async (dispatch) => {
    dispatch(authenticate(signupPayload, "/auth/signup"));
  };

export const me = (): AppThunk => async (dispatch) => {
  try {
    dispatch(authStart());

    const res: Response<User> = await httpClient.get("/auth/me");

    if (res.status === "fail") {
      return dispatch(authFail(res.data));
    }

    dispatch(authSuccess(res.data));
  } catch (error) {
    if (isInternalError(error)) {
      dispatch(authFail([error.message]));
    }
  }
};

export const logout = (): AppThunk => async (dispatch) => {
  try {
    const res = await httpClient.get("/auth/logout");

    if (res.status === "fail") {
      return showError("Something went wrong");
    }

    dispatch(logoutSuccess());
  } catch (error) {
    if (isInternalError(error)) {
      showError(error.message);
    }
  }
};

export const updateProfile =
  ({
    name,
    email,
    photo,
  }: {
    name: string;
    email: string;
    photo: string;
  }): AppThunk =>
  async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const res: Response<User> = await httpClient.patch(
        `/users/${auth.data?.id}`,
        {
          data: {
            name,
            email,
            photo,
          },
        }
      );

      if (res.status === "fail") {
        showError(res.data[0] as string);
        return;
      }

      showSuccess("Profile updated");
      dispatch(updateProfileSuccess(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
      }
    }
  };

export const { authStart, authFail, authSuccess, updateProfileSuccess } =
  slice.actions;

export default slice.reducer;
