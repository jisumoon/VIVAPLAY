import React from "react";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  authenticate: boolean;
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  authenticate,
  children,
}) => {
  return authenticate ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
