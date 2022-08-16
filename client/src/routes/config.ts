import React from "react";
import { RouteProps } from "react-router-dom";
import { Role } from "../types";

const Signin = React.lazy(() => import("../pages/Signin"));
const Signup = React.lazy(() => import("../pages/Signup"));
const Home = React.lazy(() => import("../pages/Home"));
const Profile = React.lazy(() => import("../pages/Profile"));
const ApartmentForm = React.lazy(() => import("../pages/ApartmentForm"));
const ApartmentDetail = React.lazy(() => import("../pages/ApartmentDetail"));
const Users = React.lazy(() => import("../pages/Users"));

export interface RouteConfigProps extends RouteProps {
  private: boolean;
  isAllowed?: (role?: Role) => boolean;
}

export const PATHS = {
  signin: "/signin",
  signup: "/signup",
  home: "/",
  profile: "/profile",
  addApartment: "/add-apartment",
  apartmentDetail: "/apartment/:id",
  editApartment: "/edit-apartment/:id",
  users: "/users",
  usersEdit: "/users/:id",
  addUser: "/add-user",
};

const config = [
  {
    component: Signin,
    path: PATHS.signin,
    private: false,
    exact: true,
  },
  {
    component: Signup,
    path: PATHS.signup,
    private: false,
    exact: true,
  },
  {
    component: Home,
    path: PATHS.home,
    private: true,
    exact: true,
  },
  {
    component: Profile,
    path: PATHS.profile,
    private: true,
    exact: true,
  },
  {
    component: ApartmentForm,
    path: PATHS.addApartment,
    private: true,
    exact: true,
    isAllowed: (role?: Role) => [Role.admin, Role.realtor].includes(role!),
  },
  {
    component: ApartmentDetail,
    path: PATHS.apartmentDetail,
    private: true,
    exact: true,
  },
  {
    component: ApartmentForm,
    path: PATHS.editApartment,
    private: true,
    exact: true,
    isAllowed: (role?: Role) => [Role.admin, Role.realtor].includes(role!),
  },
  {
    component: Users,
    path: PATHS.users,
    private: true,
    exact: true,
    isAllowed: (role?: Role) => Role.admin === role,
  },
  {
    component: Profile,
    path: PATHS.usersEdit,
    private: true,
    exact: true,
    isAllowed: (role?: Role) => Role.admin === role,
  },
  {
    component: Profile,
    path: PATHS.addUser,
    private: true,
    exact: true,
    isAllowed: (role?: Role) => Role.admin === role,
  },
];

export default config;
