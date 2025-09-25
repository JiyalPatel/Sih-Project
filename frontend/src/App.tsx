import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import TimetablePage from "./pages/Dashboard/TimetablePage";
import SubjectsPage from "./pages/Dashboard/SubjectsPage";
import FacultyPage from "./pages/Dashboard/FacultyPage";
import InstitutePage from "./pages/Dashboard/InstitutePage";
import DepartmentPage from "./pages/Dashboard/DepartmentPage";
import RoomPage from "./pages/Dashboard/RoomPage";
import ApprovalRequestsPage from "./pages/Dashboard/ApprovalRequestsPage";
import GenerateTimetablePage from "./pages/Dashboard/GenerateTimetablePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardHome />} />
                            <Route
                                path="timetable"
                                element={<TimetablePage />}
                            />
                            <Route path="subjects" element={<SubjectsPage />} />
                            <Route path="faculty" element={<FacultyPage />} />
                            <Route
                                path="institute"
                                element={<InstitutePage />}
                            />
                            <Route
                                path="department"
                                element={<DepartmentPage />}
                            />
                            <Route path="classrooms" element={<RoomPage />} />
                            <Route
                                path="approvals"
                                element={<ApprovalRequestsPage />}
                            />
                            <Route
                                path="generate"
                                element={<GenerateTimetablePage />}
                            />
                            <Route
                                path="preferences"
                                element={<TimetablePage />}
                            />
                            <Route
                                path="filters"
                                element={<ApprovalRequestsPage />}
                            />
                            <Route
                                path="view-timetable"
                                element={<TimetablePage />}
                            />
                        </Route>
                    </Route>

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
