import { useOutletContext } from "react-router-dom";
import AdminDashboard from "./RoleDashboards/AdminDashboard";
import InstituteDashboard from "./RoleDashboards/InstituteDashboard";
import HodDashboard from "./RoleDashboards/HodDashboard";
import FacultyDashboard from "./RoleDashboards/FacultyDashboard";

interface DashboardContext {
  userRole: string;
}

const DashboardHome = () => {
  const { userRole } = useOutletContext<DashboardContext>();

  const renderDashboardByRole = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "institute":
        return <InstituteDashboard />;
      case "hod":
      case "dept-admin":
        return <HodDashboard />;
      case "faculty":
        return <FacultyDashboard />;
      default:
        return <div>Welcome! Your dashboard is being set up.</div>;
    }
  };

  return <>{renderDashboardByRole()}</>;
};

export default DashboardHome;