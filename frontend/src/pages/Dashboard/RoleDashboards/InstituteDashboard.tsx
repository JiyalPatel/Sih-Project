import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardList, UserSquare, CalendarCheck } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

// Interfaces for the data we expect from the API, including the 'institute' field for filtering
interface Department {
  _id: string;
  name: string;
  institute: {_id : string};
}

interface Faculty {
  _id: string;
  name: string;
  institute: string;
}

interface Timetable {
    _id: string;
    institute: string;
}

interface Batch {
  _id: string;
  name: string;
  semester: number;
}

const InstituteDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ departments: 0, faculty: 0});
  const [loadingStats, setLoadingStats] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // CORRECTED: Using user._id to identify the institute's account, as you instructed.
  const instituteAccountId = user?._id;

  useEffect(() => {
    if (!instituteAccountId) {
      toast({
        title: "Authentication Error",
        description: "Could not identify your institute account. Please log in again.",
        variant: "destructive",
      });
      setLoadingStats(false);
      return;
    }

    const fetchAndFilterStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch all data from the general endpoints as you requested
        const [deptRes, facultyRes] = await Promise.all([
          api.get(`/departments`),
          api.get(`/faculties`), // CORRECTED: Using plural based on common convention and error logs.
          // api.get(`/timetables`),
        ]);

        

        // Filter each dataset on the client-side based on the institute's account ID
        const instituteDepartments = deptRes.data;
        const instituteFaculty = facultyRes.data;
        // const instituteTimetables = timetableRes.data;

        setStats({
          departments: instituteDepartments.length,
          faculty: instituteFaculty.length,
        });
        
        // Populate the dropdown with only the filtered departments that belong to this institute
        setDepartments(instituteDepartments);

      } catch (error) {
        console.error("Failed to fetch institute stats:", error);
        toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAndFilterStats();
  }, [instituteAccountId, toast]);

  // This useEffect for fetching batches is correct and remains unchanged
  useEffect(() => {
    if (!selectedDepartment) {
      setBatches([]);
      setSelectedBatch("");
      return;
    }
    const fetchBatches = async () => {
      try {
        const res = await api.get(`/batches`);
        
        setBatches(res.data);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      }
    };
    fetchBatches();
  }, [selectedDepartment]);
  
  const statCards = [
    { title: "Total Departments", value: stats.departments, icon: ClipboardList, color: "text-purple-500", bgColor: "bg-purple-100" },
    { title: "Total Faculty", value: stats.faculty, icon: UserSquare, color: "text-red-500", bgColor: "bg-red-100" },
    // { title: "Active Timetables", value: stats.timetables, icon: CalendarCheck, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name || 'Institute Admin'}!</h1>
        <p className="text-muted-foreground">Here's a summary of your institute's activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
        {loadingStats ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="card-elevated"><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">View Department Timetable</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end bg-sidebar p-4 rounded-lg border border-sidebar-border">
          <div className="flex-1 w-full">
            <Label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">Department</Label>
            <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
              <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
              <SelectContent>
                {departments.map(dept => <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full">
            <Label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">Batch</Label>
            <Select onValueChange={setSelectedBatch} value={selectedBatch} disabled={!selectedDepartment}>
              <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
              <SelectContent>
                {batches.map(batch => <SelectItem key={batch._id} value={batch._id}>{`Semester ${batch?.name}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={!selectedBatch} className="w-full md:w-auto">View Timetable</Button>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;

