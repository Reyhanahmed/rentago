export enum Role {
  client = 1,
  realtor = 2,
  admin = 3,
}

export type ApiStatus = "idle" | "resolved" | "rejected" | "pending";

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string;
  role: Role;
}

export interface UserCredentials {
  email: string;
  password: string;
  role?: Role;
  name?: string;
}

export interface ResponseSuccess<T> {
  status: "success";
  statusCode: number;
  data: T;
}

export interface ResponseFail {
  status: "fail";
  statusCode: number;
  data: ErrorDataType;
}

export interface InternalError {
  status: "error";
  statusCode: 500;
  message: string;
}

export type Response<T> = ResponseSuccess<T> | ResponseFail;

export type ErrorDataType = string[] | Record<string, string>[];

export interface Apartment {
  id: number;
  name: string;
  photo?: string;
  floorArea: number;
  rent: number;
  rooms: number;
  address: string;
  description: string;
  location: Coordinates;
  createdAt: string;
  realtor: User;
  available?: boolean;
}

export type AddApartment = Omit<Apartment, "id" | "createdAt" | "realtor"> & {
  realtorId?: number;
};

export interface ApartmentsResponse {
  apartments: Apartment[];
  count: number;
}

export interface ApartmentFiltersObject {
  name: string;
  rooms: number;
  floorArea: number;
  rent: number[];
  lat?: number;
  long?: number;
}

export interface UsersResponse {
  users: User[];
  count: number;
}

export type AddUser = Omit<User, "id" | "role">;

export interface Coordinates {
  lat: number;
  long: number;
}
