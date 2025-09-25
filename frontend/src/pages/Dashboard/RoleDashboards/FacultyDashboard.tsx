import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import the necessary icons from lucide-react
import { Clock, MapPin } from "lucide-react";
import TimetableGrid from "@/components/Timetable/TimetableGrid";
import { Calendar } from "lucide-react";

const FacultyDashboard = () => {
  // Mock data updated to include all the necessary fields for the new UI
  const upcomingClasses = [
    { 
      subject: "Data Structures & Algorithms", 
      faculty: "Prof. Alan Turing", // This would typically be the current user's name
      time: "10:00 AM - 11:00 AM", 
      room: "Room 303" 
    },
    { 
      subject: "Advanced Database Systems", 
      faculty: "Prof. Ada Lovelace",
      time: "02:00 PM - 03:00 PM", 
      room: "Lab 5B" 
    },
     { 
      subject: "Compiler Design", 
      faculty: "Prof. Grace Hopper",
      time: "04:00 PM - 05:00 PM", 
      room: "Room 101" 
    },
  ];

  return (
    <div className="space-y-8 ">

      {/* Welcome Section */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Prof. Name!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your Department timetables today.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
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


        {/* Upcoming Classes - NEW DESIGN */}
        <div className="animate-fade-up animation-delay-200">
             <Card className="card-elevated">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-foreground">
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
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;