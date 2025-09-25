import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardList, UserSquare, CalendarCheck } from "lucide-react";

const InstituteDashboard = () => {
  // 1. Restructure stats data
  const stats = [
    {
      title: "Total Departments",
      value: "8",
      change: "+1 this year",
      icon: ClipboardList,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Faculty",
      value: "75",
      change: "+5 new members",
      icon: UserSquare,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      title: "Active Timetables",
      value: "4",
      change: "Fall 2024",
      icon: CalendarCheck,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
  ];
  return (
    <div className="space-y-8 ">
       {/* Welcome Section */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Institute!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your timetables today.
        </p>
      </div>

      {/* 2. Map over the new stats array */}
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

      <h2 className="text-2xl font-bold mb-4">View Department Timetable</h2>
      <div className="flex gap-4 items-end bg-card p-4 rounded-lg border">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Department</label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>{/* Populate with data */}</SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Semester</label>
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

export default InstituteDashboard;