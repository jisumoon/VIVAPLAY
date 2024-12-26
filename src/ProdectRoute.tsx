import React from "react";
import { Navigate } from "react-router-dom";
import { islogin } from "./recoil/atom";
import { useRecoilValue } from "recoil";

interface ProdectRoute {
  children: JSX.Element;
}

const PodectRoute = ({ children }: ProdectRoute) => {
  const isloginValue = useRecoilValue(islogin);

  if (!isloginValue) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PodectRoute;
