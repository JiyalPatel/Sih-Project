import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building, Users, GanttChartSquare } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for our data
interface Institute {
    _id: string;
    name: string;
}

interface Department {
    _id: string;
    name: string;
    institute: { _id: string };
}

interface Batch {
    _id: string;
    semester: number;
}

const AdminDashboard = () => {
    // State for statistics
    const [stats, setStats] = useState({
        institutes: 0,
        users: 0,
        timetables: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // State for dropdowns
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);

    // State for selected values
    const [selectedInstitute, setSelectedInstitute] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [selectedBatch, setSelectedBatch] = useState<string>("");

    // --- Data Fetching ---

    // Fetch initial stats on component mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const [institutesRes, usersRes, timetablesRes] =
                    await Promise.all([
                        api.get("/institutes"),
                        api.get("/users"),
                        api.get("/timetables"),
                    ]);

                setStats({
                    institutes: institutesRes.data.length,
                    users: usersRes.data.length,
                    timetables: timetablesRes.data.length,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    // Fetch all institutes for the dropdown
    useEffect(() => {
        const fetchInstitutes = async () => {
            try {
                // CORRECTED HERE
                const res = await api.get("/institutes");
                setInstitutes(res.data);
            } catch (error) {
                console.error("Failed to fetch institutes:", error);
            }
        };
        fetchInstitutes();
    }, []);

    // Fetch departments when an institute is selected
    useEffect(() => {
        if (!selectedInstitute) {
            setDepartments([]);
            setBatches([]);
            return;
        }
        const fetchDepartments = async () => {
            try {
                // CORRECTED HERE
                const res = await api.get(`/departments`);
                console.log(res.data);
                           
                // Filter departments belonging to the selected institute
                const filteredDepts = res.data.filter(
                    (dept: Department) => dept.institute._id === selectedInstitute
                );
                setDepartments(filteredDepts);
                //
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            }
        };
        fetchDepartments();
    }, [selectedInstitute]);

    // Fetch batches (semesters) when a department is selected
    useEffect(() => {
        if (!selectedDepartment) {
            setBatches([]);
            return;
        }
        const fetchBatches = async () => {
            try {
                // CORRECTED HERE
                const res = await api.get(
                    `/batches/department/${selectedDepartment}`
                );
                setBatches(res.data);
            } catch (error) {
                console.error("Failed to fetch batches:", error);
            }
        };
        fetchBatches();
    }, [selectedDepartment]);

    const handleViewTimetable = () => {
        console.log({
            institute: selectedInstitute,
            department: selectedDepartment,
            batch: selectedBatch,
        });
    };

    const statCards = [
        {
            title: "Total Institutes",
            value: stats.institutes,
            icon: Building,
            color: "text-blue-500",
            bgColor: "bg-blue-100",
        },
        {
            title: "Total Users",
            value: stats.users,
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-100",
        },
        {
            title: "Total Timetables",
            value: stats.timetables,
            icon: GanttChartSquare,
            color: "text-orange-500",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-foreground">
                Admin Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-up">
                {loadingStats
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="card-elevated">
                              <CardContent className="p-6">
                                  <Skeleton className="h-24 w-full" />
                              </CardContent>
                          </Card>
                      ))
                    : statCards.map((stat) => {
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
                                          </div>
                                          <div
                                              className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                                          >
                                              <Icon
                                                  className={`w-6 h-6 ${stat.color}`}
                                              />
                                          </div>
                                      </div>
                                  </CardContent>
                              </Card>
                          );
                      })}
            </div>

            <h2 className="text-2xl font-bold mb-4 text-foreground">
                View Timetable
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-end bg-sidebar p-4 rounded-lg border border-sidebar-border">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">
                        Institute
                    </label>
                    <Select
                        onValueChange={setSelectedInstitute}
                        value={selectedInstitute}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Institute" />
                        </SelectTrigger>
                        <SelectContent>
                            {institutes.map((inst) => (
                                <SelectItem key={inst._id} value={inst._id}>
                                    {inst.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">
                        Department
                    </label>
                    <Select
                        onValueChange={setSelectedDepartment}
                        value={selectedDepartment}
                        disabled={!selectedInstitute}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept._id} value={dept._id}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 text-sidebar-foreground/70">
                        Semester
                    </label>
                    <Select
                        onValueChange={setSelectedBatch}
                        value={selectedBatch}
                        disabled={!selectedDepartment}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((batch) => (
                                <SelectItem
                                    key={batch._id}
                                    value={batch._id}
                                >{`Semester ${batch.semester}`}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleViewTimetable}
                    disabled={!selectedBatch}
                    className="w-full md:w-auto"
                >
                    View
                </Button>
            </div>
        </div>
    );
};

export default AdminDashboard;
