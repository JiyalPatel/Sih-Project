import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TimetableGrid from "@/components/Timetable/TimetableGrid";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  CheckCircle,
  TrendingUp,
  Clock,
  MapPin,
  Award
} from "lucide-react";

const DashboardHome = () => {
  const { userRole = "faculty" } = useOutletContext<{ userRole: string }>();
  const isAdmin = userRole === "admin";

  const stats = [
    {
      title: "Total Subjects",
      value: "24",
      change: "+2 this week",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Faculty Members",
      value: "48",
      change: "+3 this month",
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Active Timetables",
      value: "12",
      change: "All updated",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: isAdmin ? "Pending Approvals" : "Completed Classes",
      value: isAdmin ? "8" : "156",
      change: isAdmin ? "Needs attention" : "This semester",
      icon: isAdmin ? CheckCircle : Award,
      color: isAdmin ? "text-warning" : "text-success",
      bgColor: isAdmin ? "bg-warning/10" : "bg-success/10"
    }
  ];

  const recentActivities = [
    {
      action: "New timetable generated",
      department: "Computer Science",
      time: "2 hours ago",
      type: "success"
    },
    {
      action: "Faculty preference updated",
      department: "Dr. Smith - Data Structures",
      time: "4 hours ago",
      type: "info"
    },
    {
      action: "Approval request submitted",
      department: "Information Technology",
      time: "6 hours ago",
      type: "warning"
    },
    {
      action: "Room conflict resolved",
      department: "CS-101 Lab",
      time: "1 day ago",
      type: "success"
    }
  ];

  const upcomingClasses = [
    {
      subject: "Data Structures",
      faculty: "Dr. Smith",
      time: "10:00 AM",
      room: "CS-101",
      type: "Lecture"
    },
    {
      subject: "Database Systems",
      faculty: "Dr. Johnson",
      time: "2:00 PM",
      room: "CS-102",
      type: "Lab"
    },
    {
      subject: "Web Development",
      faculty: "Prof. Davis",
      time: "3:00 PM",
      room: "CS-103",
      type: "Tutorial"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {isAdmin ? "Admin" : "Faculty"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your timetables today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up">
        {stats.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Timetable */}
        <div className="lg:col-span-2">
          <Card className="card-elevated animate-fade-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimetableGrid compact />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Classes */}
          <Card className="card-elevated animate-fade-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((cls, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {cls.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cls.faculty}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-primary font-medium">
                          {cls.time}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-elevated animate-fade-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-success' :
                      activity.type === 'warning' ? 'bg-warning' : 'bg-primary'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-elevated animate-fade-up">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full btn-primary" size="sm">
                Generate New Timetable
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View All Schedules
              </Button>
              {isAdmin && (
                <Button variant="outline" className="w-full" size="sm">
                  Review Approvals
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;