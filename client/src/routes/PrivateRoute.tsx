import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { RootState } from "../redux";
import { PATHS, RouteConfigProps } from "./config";

const PrivateRoute = ({
  component: Component,
  isAllowed,
  ...restProps
}: RouteConfigProps) => {
  const authState = useSelector((state: RootState) => state.auth);
  return (
    <Route
      {...restProps}
      render={(props) => {
        if (
          authState.isAuthenticated &&
          Component &&
          (!isAllowed || isAllowed(authState?.data?.role))
        ) {
          return <Component {...props} />;
        }

        return <Redirect from={restProps.path as string} to={PATHS.signin} />;
      }}
    />
  );
};

export default PrivateRoute;
