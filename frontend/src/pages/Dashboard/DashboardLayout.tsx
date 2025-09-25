import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Layout/Sidebar";

const DashboardLayout = () => {
    // Get the user from localStorage and provide a fallback
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    let userRole = user.role || "guest"; // Default to 'guest' or another role if not found
    return (
        <div className="min-h-screen bg-background">
            <div className="flex w-full">
                <Sidebar userRole={userRole} />

                <div className="flex-1 lg:ml-0">
                    <main className="p-6">
                        <Outlet context={{ userRole }} />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
