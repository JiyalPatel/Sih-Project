import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building, Users, GanttChartSquare } from "lucide-react";

const AdminDashboard = () => {
  // 1. Restructure stats data to match the new card format
  const stats = [
    {
      title: "Total Institutes",
      value: "12",
      change: "+2 this month",
      icon: Building,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Users",
      value: "350",
      change: "+15 this month",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Timetables",
      value: "45",
      change: "+5 this month",
      icon: GanttChartSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-8 ">
       {/* Welcome Section */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Admin!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your timetables today.
        </p>
      </div>

      
           {/* 2. Map over the stats data to render the new cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-up">
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

      {/* Timetable Selector with custom theme */}
      <h2 className="text-2xl font-bold mb-4 text-foreground">View Timetable</h2>
      <div className="flex gap-4 items-end bg-sidebar p-4 rounded-lg border border-sidebar-border">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">Institute</label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Institute" /></SelectTrigger>
            <SelectContent>{/* Populate with data */}</SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">Department</label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>{/* Populate with data */}</SelectContent>
          </Select>
        </div>
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
  );
};

export default AdminDashboard;