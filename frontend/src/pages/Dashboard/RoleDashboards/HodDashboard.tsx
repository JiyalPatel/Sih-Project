import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
// Import necessary icons
import { Users, BookOpen, ClipboardCheck, GanttChartSquare } from "lucide-react";

const HodDashboard = () => {
  // Mock data - replace with API calls for the specific department
  const stats = [
    {
      title: "Total Faculty",
      value: "15",
      change: "in your department",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Subjects",
      value: "25",
      change: "this semester",
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Approvals",
      value: "3",
      change: "awaiting review",
      icon: ClipboardCheck,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
        title: "Active Timetables",
        value: "2",
        change: "for current batches",
        icon: GanttChartSquare,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
      },
  ];

  return (
    <div className="space-y-8 ">
       {/* Welcome Section */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, HOD Name!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your Department timetables today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-up">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className={`text-xs ${stat.color} mt-1`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Actions</h2>
        <div className="flex gap-4">
           
            <Button asChild variant="outline">
                <Link to="/dashboard/faculty">Manage Faculty</Link>
            </Button>
            <Button asChild variant="outline">
                <Link to="/dashboard/subjects">Manage Subjects</Link>
            </Button>
        </div>
      </div>

      {/* Timetable Selector */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">View Semester Timetable</h2>
        <div className="flex gap-4 items-end bg-sidebar p-4 rounded-lg border border-sidebar-border max-w-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">Semester</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
              <SelectContent>{/* Populate with data */}</SelectContent>
            </Select>
          </div>
          <Button>View</Button>
        </div>
      </div>

    </div>
  );
};

export default HodDashboard;