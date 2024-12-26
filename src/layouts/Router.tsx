import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Search from "../pages/Search";
import Love from "../pages/Love";
import Detail from "../pages/Detail";
import MobileSearch from "../pages/MobileSearch";
import Join from "../pages/Join";
import PodectRoute from "../ProdectRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/movies/:movieId",
        element: (
          <PodectRoute>
            <Detail />
          </PodectRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "join",
        element: <Join />,
      },
      {
        path: "love",
        element: (
          <PodectRoute>
            <Love />
          </PodectRoute>
        ),
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "msearch",
        element: <MobileSearch />,
      },
    ],
  },
]);

export default router;
