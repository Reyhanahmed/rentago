import React, { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Loader } from "../components/Loader";
import { RootState } from "../redux";
import { me } from "../redux/slices/auth";

import routes, { PATHS } from "./config";
import PrivateRoute from "./PrivateRoute";

const Routes = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const [isAuthenticating, setIsAuthenticating] = React.useState(true);

  React.useEffect(() => {
    dispatch(me());
  }, [dispatch]);

  React.useEffect(() => {
    if (authState.isAuthenticated || authState.error) {
      setIsAuthenticating(false);
    }
  }, [authState.isAuthenticated, authState.error]);

  if (isAuthenticating) {
    return <Loader size="lg" />;
  }

  return (
    <Router>
      <Suspense fallback={<Loader size="lg" />}>
        <Switch>
          {routes.map((route) => {
            const Component = route.private ? PrivateRoute : Route;

            return <Component key={route.path} {...route} />;
          })}
          <Redirect to={PATHS.signin} />
        </Switch>
      </Suspense>
    </Router>
  );
};

export default Routes;
