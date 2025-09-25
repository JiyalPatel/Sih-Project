import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Home,
    Calendar,
    BookOpen,
    Users,
    Settings,
    Zap,
    CheckCircle,
    Filter,
    Eye,
    Menu,
    X,
    LogOut,
    GraduationCap,
} from "lucide-react";

interface SidebarProps {
    userRole?: string;
}

const Sidebar = ({ userRole = "faculty" }: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isAdmin = userRole === "admin";

    const commonNavItems = [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Calendar, label: "Timetable", path: "/dashboard/timetable" },
        { icon: BookOpen, label: "Subjects", path: "/dashboard/subjects" },
        { icon: Users, label: "Faculty", path: "/dashboard/faculty" },
    ];

    const adminNavItems = [
        {
            icon: CheckCircle,
            label: "Approval Requests",
            path: "/dashboard/approvals",
        },
        { icon: Filter, label: "Filters", path: "/dashboard/filters" },
        {
            icon: Eye,
            label: "View Timetable",
            path: "/dashboard/view-timetable",
        },
    ];

    const facultyNavItems = [
        {
            icon: Settings,
            label: "Preferences",
            path: "/dashboard/preferences",
        },
        { icon: Zap, label: "Generate Timetable", path: "/dashboard/generate" },
    ];

    const navigationItems = [
        ...commonNavItems,
        ...(isAdmin ? adminNavItems : facultyNavItems),
    ];

    const isActivePath = (path: string) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
        fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50
        transition-all duration-300 flex flex-col
        ${isCollapsed ? "w-16" : "w-64"}
        lg:relative lg:translate-x-0
        ${isCollapsed ? "translate-x-0" : "translate-x-0"}
      `}
            >
                {/* Header */}
                <div className="p-4 border-b border-sidebar-border">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-sidebar-foreground">
                                        Smart Classroom
                                    </h2>
                                    <p className="text-xs text-sidebar-foreground/70">
                                        Dashboard
                                    </p>
                                </div>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-sidebar-foreground hover:bg-sidebar-accent"
                        >
                            {isCollapsed ? (
                                <Menu className="w-4 h-4" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                  sidebar-item
                  ${isActive ? "sidebar-item-active" : ""}
                  ${isCollapsed ? "justify-center" : ""}
                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && (
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-sidebar-border">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={`
              w-full text-sidebar-foreground hover:bg-sidebar-accent
              ${isCollapsed ? "px-2" : "justify-start"}
            `}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="ml-3">Logout</span>}
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
