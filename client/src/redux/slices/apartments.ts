import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk } from "..";
import { MAX_PRICE_RANGE } from "../../constants";
import {
  AddApartment,
  Apartment,
  ApartmentFiltersObject,
  ApartmentsResponse,
  ApiStatus,
  ErrorDataType,
  Response,
} from "../../types";
import { httpClient } from "../../utils/httpClient";
import { isInternalError } from "../../utils/isInternalError";
import { showError, showSuccess } from "../../utils/toast";

interface IApartmentsState {
  data: Apartment[];
  count: number;
  status: ApiStatus;
  error?: ErrorDataType | null;
  selectedApartment: Apartment | null;
}

const initialState: IApartmentsState = {
  data: [],
  count: 0,
  status: "idle",
  error: null,
  selectedApartment: null,
};

const slice = createSlice({
  name: "apartments",
  initialState,
  reducers: {
    getApartmentsStart: (state) => {
      state.status = "pending";
      state.error = null;
    },
    getApartmentsFail: (state, action: PayloadAction<ErrorDataType>) => {
      state.status = "rejected";
      state.error = action.payload;
    },
    getApartmentsSuccess: (
      state,
      action: PayloadAction<ApartmentsResponse>
    ) => {
      state.status = "resolved";
      state.data = action.payload.apartments;
      state.count = action.payload.count;
    },
    addApartmentSuccess: (state, action: PayloadAction<Apartment>) => {
      state.data = [action.payload, ...state.data];
      state.count++;
    },
    setSelectedApartment: (state, action: PayloadAction<Apartment | null>) => {
      state.status = "resolved";
      state.selectedApartment = action.payload;
    },
  },
});

export const {
  addApartmentSuccess,
  getApartmentsStart,
  getApartmentsFail,
  getApartmentsSuccess,
  setSelectedApartment,
} = slice.actions;

export const addApartment =
  (apartment: AddApartment): AppThunk =>
  async (dispatch) => {
    try {
      const res: Response<Apartment> = await httpClient.post(`/apartments`, {
        data: apartment,
      });

      if (res.status === "fail") {
        const error = res.data[0];
        if (typeof error === "string") {
          return showError(error);
        } else {
          return showError("Data submitted is not correct");
        }
      }

      dispatch(addApartmentSuccess(res.data));
      dispatch(setSelectedApartment(res.data));
      showSuccess("Apartment added");
      return Promise.resolve(true);
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
        return Promise.resolve(false);
      }
    }
  };

export const getApartments =
  (page: number = 1, filters?: ApartmentFiltersObject): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(getApartmentsStart());

      const name = filters?.name || undefined;
      const rooms = filters?.rooms || undefined;
      const rentMin =
        filters?.rent?.[0] !== 0 || filters?.rent?.[1] !== MAX_PRICE_RANGE
          ? filters?.rent?.[0]
          : undefined;
      const rentMax =
        filters?.rent?.[0] !== 0 || filters?.rent?.[1] !== MAX_PRICE_RANGE
          ? filters?.rent?.[1]
          : undefined;
      const floorArea = filters?.floorArea || undefined;
      const lat = filters?.lat || undefined;
      const long = filters?.long || undefined;

      const res: Response<ApartmentsResponse> = await httpClient.get(
        "/apartments",
        {
          data: { page, name, rooms, rentMin, rentMax, floorArea, lat, long },
        }
      );

      if (res.status === "fail") {
        showError("Could not fetch apartments");
        return dispatch(getApartmentsFail(res.data));
      }

      dispatch(getApartmentsSuccess(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
        dispatch(getApartmentsFail([error.message]));
      }
    }
  };

export const getApartmentDetails =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      const res: Response<Apartment> = await httpClient.get(
        `/apartments/${id}`
      );

      if (res.status === "fail") {
        if (typeof res.data[0] === "string") {
          showError(res.data[0]);
        } else {
          showError("Could not fetch apartment detail");
        }
        return dispatch(getApartmentsFail(res.data));
      }

      dispatch(setSelectedApartment(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
        dispatch(getApartmentsFail([error.message]));
      }
    }
  };

export const updateApartment =
  (id: string, apartment: Partial<AddApartment>): AppThunk =>
  async (dispatch) => {
    try {
      const res: Response<Apartment> = await httpClient.patch(
        `/apartments/${id}`,
        {
          data: apartment,
        }
      );

      if (res.status === "fail") {
        if (typeof res.data[0] === "string") {
          return showError(res.data[0]);
        }
        return showError("Could not update the availability status");
      }

      dispatch(setSelectedApartment(res.data));
    } catch (error) {
      if (isInternalError(error)) {
        showError(error.message);
      }
    }
  };

export const deleteApartment =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      const res: { status: string; statusCode: number } =
        await httpClient.delete(`/apartments/${id}`);

      if (res.status === "fail") {
        return showError("Could not delete apartment");
      }

      dispatch(setSelectedApartment(null));
    } catch (error) {
      if (isInternalError(error)) {
        showError("Something went wrong");
      }
    }
  };

export default slice.reducer;
