import { useSearchParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";

const DashboardLayout = () => {
  const [searchParams] = useSearchParams();
  const userRole = searchParams.get("role") || "faculty";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <Sidebar userRole={userRole} />
        
        <div className="flex-1 lg:ml-0">
          <Header 
            showAuth={false} 
            showSearch={true} 
            title="Smart Classroom Dashboard"
          />
          
          <main className="p-6">
            <Outlet context={{ userRole }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;