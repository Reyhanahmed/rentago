import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk } from "..";
import {
  AddUser,
  ApiStatus,
  ErrorDataType,
  Response,
  User,
  UserCredentials,
  UsersResponse,
} from "../../types";
import { httpClient } from "../../utils/httpClient";
import { isInternalError } from "../../utils/isInternalError";
import { showError, showSuccess } from "../../utils/toast";

interface IUsersState {
  data: User[];
  count: number;
  status: ApiStatus;
  error?: ErrorDataType | null;
  selectedUser: User | null;
}

const initialState: IUsersState = {
  data: [],
  count: 0,
  status: "idle",
  error: null,
  selectedUser: null,
};

const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getUsersStart(state) {
      state.status = "pending";
      state.error = null;
    },
    getUsersSuccess(state, action: PayloadAction<UsersResponse>) {
      state.status = "resolved";
      state.error = null;
      state.data = action.payload.users;
      state.count = action.payload.count;
    },
    getUsersFail(state, action: PayloadAction<ErrorDataType>) {
      state.status = "rejected";
      state.error = action.payload;
    },
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.status = "resolved";
      state.selectedUser = action.payload;
    },
  },
});

export const { getUsersStart, getUsersSuccess, getUsersFail, setSelectedUser } =
  slice.actions;

export const getUsers =
  (page: number = 1, name?: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(getUsersStart());

      const res: Response<UsersResponse> = await httpClient.get("/users", {
        data: {
          page,
          name: name || undefined,
        },
      });

      if (res.status === "fail") {
        showError("Could not fetch users");
        return dispatch(getUsersFail(res.data));
      }

      dispatch(getUsersSuccess(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
        dispatch(getUsersFail([error.message]));
      }
    }
  };

export const getUserDetails =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      const res: Response<User> = await httpClient.get(`/users/${id}`);

      if (res.status === "fail") {
        if (typeof res.data[0] === "string") {
          showError(res.data[0]);
        } else {
          showError("Could not fetch user detail");
        }
        return dispatch(getUsersFail(res.data));
      }

      dispatch(setSelectedUser(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
        dispatch(getUsersFail([error.message]));
      }
    }
  };

export const deleteUser =
  (id: number): AppThunk =>
  async (dispatch, getState) => {
    try {
      const users = getState().users.data;
      let usersCount = getState().users.count;

      const res: { status: string; statusCode: number } =
        await httpClient.delete(`/users/${id}`);

      if (res.status === "fail") {
        return showError("Could not delete user.");
      }

      const usersWithoutDeletedUser = users.filter((usr) => usr.id !== id);
      dispatch(
        getUsersSuccess({ users: usersWithoutDeletedUser, count: --usersCount })
      );
      dispatch(setSelectedUser(null));
      showSuccess("User deleted successfully");
    } catch (error) {
      if (isInternalError(error)) {
        showError("Something went wrong");
      }
    }
  };

export const updateUser =
  (id: string, user: AddUser): AppThunk =>
  async (dispatch) => {
    try {
      const res: Response<User> = await httpClient.patch(`/users/${id}`, {
        data: user,
      });

      if (res.status === "fail") {
        if (typeof res.data[0] === "string") {
          showError(res.data[0]);
        } else {
          showError("Could not update user");
        }
        return;
      }

      showSuccess("Profile updated");
      dispatch(setSelectedUser(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
      }
    }
  };

export const addUser =
  (user: UserCredentials & { photo?: string }): AppThunk =>
  async (dispatch) => {
    try {
      const res: Response<User> = await httpClient.post("/users", {
        data: user,
      });

      if (res.status === "fail") {
        showError("Could not add user");
        return;
      }

      dispatch(setSelectedUser(null));
      showSuccess("User added");
    } catch (error) {
      showError("Something went wrong");
    }
  };

export default slice.reducer;
