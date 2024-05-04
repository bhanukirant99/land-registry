
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";
//import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import Login from "../../auth/login/index";
import DashboardRender from "./DashboardRender";

export default function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  // const isLoggedIn = sessionStorage.getItem("login");
  // console.log(isLoggedIn);

  return <DashboardRender/>;
}

 
