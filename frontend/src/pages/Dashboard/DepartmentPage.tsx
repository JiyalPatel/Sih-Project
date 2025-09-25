import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Building, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// --- Corrected Interfaces to match backend populated models ---

// The User object that gets populated inside the HOD
interface PopulatedUser {
    _id: string;
    name: string;
}

// The HOD object, which contains the populated user
interface Hod {
    _id: string;
    name: string;
    email: string;
    user?: PopulatedUser; // The populated user field
}

// The Department, with an optional, populated HOD
interface Department {
    _id: string;
    name: string;
    institute: string;
    hod?: Hod;
}

// The Institute, with a populated institute_acc field
interface Institute {
    _id: string;
    institute_acc: {
        _id: string;
        // The backend also populates name and email, but _id is all we need here
    };
}

const DepartmentPage = () => {
    const { toast } = useToast();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false); // Reverted state name for clarity
    const [editingDepartment, setEditingDepartment] =
        useState<Department | null>(null);

    // This state will hold the actual MongoDB _id of the institute document
    const [actualInstituteId, setActualInstituteId] = useState<string | null>(
        null
    );

    const initialFormData = {
        name: "",
        hodName: "",
        hodEmail: "",
        hodPassword: "",
    };
    const [formData, setFormData] = useState(initialFormData);

    // --- Data Fetching and Management ---

    const fetchDepartments = useCallback(
        async (instituteId: string) => {
            setIsLoading(true);
            try {
                const response = await api.get(
                    `/departments?instituteId=${instituteId}`
                );
                setDepartments(response.data);
            } catch (error) {
                console.error("Failed to fetch department data:", error);
                toast({
                    title: "Error",
                    description: "Could not load department data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );
   

    useEffect(() => {
        const findInstituteIdAndFetchDepts = async () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setIsLoading(false);
                toast({
                    title: "Authentication Error",
                    description: "User not found. Please log in again.",
                    variant: "destructive",
                });
                return;
            }
            const user = JSON.parse(userStr);
            const instituteAccountId = user?._id;

            if (!instituteAccountId) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await api.get("/institutes");
                const allInstitutes: Institute[] = res.data;

                const matchingInstitute = allInstitutes.find(
                    (inst) => inst.institute_acc._id === instituteAccountId
                );

                if (matchingInstitute) {
                    setActualInstituteId(matchingInstitute._id);
                    await fetchDepartments(matchingInstitute._id);
                } else {
                    toast({
                        title: "Error",
                        description:
                            "Could not find a matching institute for your account.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to verify institute data.",
                    variant: "destructive",
                });
                setIsLoading(false);
            }
        };

        findInstituteIdAndFetchDepts();
    }, [fetchDepartments, toast]);

    // --- Event Handlers ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actualInstituteId) {
            toast({
                title: "Error",
                description: "Institute ID not found. Cannot save department.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (editingDepartment) {
                const payload = {
                    name: formData.name,
                    instituteId: actualInstituteId,
                };
                await api.put(`/departments/${editingDepartment._id}`, payload);
                toast({
                    title: "Success",
                    description: "Department updated successfully.",
                });
            } else {
                const departmentPayload = {
                    name: formData.name,
                    instituteId: actualInstituteId,
                };
                const departmentResponse = await api.post(
                    "/departments",
                    departmentPayload
                );
                const newDepartmentId = departmentResponse.data._id;

                const hodPayload = {
                    name: formData.hodName,
                    email: formData.hodEmail,
                    password: formData.hodPassword,
                    departmentId: newDepartmentId,
                };
                await api.post("/hods", hodPayload);

                toast({
                    title: "Success",
                    description:
                        "Department and HOD account created successfully.",
                });
            }
            resetForm();
            if (actualInstituteId) await fetchDepartments(actualInstituteId);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to save department.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (departmentId: string) => {
        try {
            await api.delete(`/departments/${departmentId}`);
            setDepartments(departments.filter((d) => d._id !== departmentId));
            toast({
                title: "Success",
                description: "Department and associated HOD deleted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete department.",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingDepartment(null);
        setShowAddForm(false); // Use the reverted state setter
    };

    const handleEdit = (department: Department) => {
        setEditingDepartment(department);
        setFormData({ ...initialFormData, name: department.name });
        setShowAddForm(true); // Use the reverted state setter
    };

    const handleAddNew = () => {
        setEditingDepartment(null);
        setFormData(initialFormData);
        setShowAddForm(true); // Use the reverted state setter
    };

    // --- Render Logic ---

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Departments
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your institute's academic departments and their
                        heads.
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
            </div>

            {/* --- Add/Edit Form Card (Reverted UI) --- */}
            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingDepartment
                                ? "Edit Department"
                                : "Add New Department & HOD"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Computer Engineering"
                                    required
                                />
                            </div>

                            {!editingDepartment && (
                                <>
                                    <div className="border-t pt-4">
                                        <Label className="text-lg font-semibold">
                                            HOD Account Details
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Create a user account for the Head
                                            of Department.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hodName">
                                            HOD Full Name
                                        </Label>
                                        <Input
                                            id="hodName"
                                            value={formData.hodName}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    hodName: e.target.value,
                                                })
                                            }
                                            placeholder="e.g., Dr. Alan Turing"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hodEmail">
                                            HOD Email
                                        </Label>
                                        <Input
                                            id="hodEmail"
                                            type="email"
                                            value={formData.hodEmail}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    hodEmail: e.target.value,
                                                })
                                            }
                                            placeholder="hod@institute.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hodPassword">
                                            Password
                                        </Label>
                                        <Input
                                            id="hodPassword"
                                            type="password"
                                            value={formData.hodPassword}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    hodPassword: e.target.value,
                                                })
                                            }
                                            placeholder="Enter a secure password"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button type="submit">
                                    {editingDepartment
                                        ? "Save Changes"
                                        : "Create Department"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* --- Department Cards Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-48 rounded-lg" />
                      ))
                    : departments.map((dept) => (
                          <Card
                              key={dept._id}
                              className="hover:shadow-lg transition-shadow"
                          >
                              <CardHeader className="flex flex-row items-center justify-between pb-2">
                                  <CardTitle className="text-xl font-bold">
                                      {dept.name}
                                  </CardTitle>
                                  <div className="flex gap-2">
                                      <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleEdit(dept)}
                                      >
                                          <Edit className="w-4 h-4" />
                                      </Button>
                                      <Dialog>
                                          <DialogTrigger asChild>
                                              <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="text-red-500 hover:text-red-600"
                                              >
                                                  <Trash2 className="w-4 h-4" />
                                              </Button>
                                          </DialogTrigger>
                                          <DialogContent className="bg-white">
                                              <DialogHeader>
                                                  <DialogTitle>
                                                      Are you sure?
                                                  </DialogTitle>
                                              </DialogHeader>
                                              <p>
                                                  This action will permanently
                                                  delete the{" "}
                                                  <strong>{dept.name}</strong>{" "}
                                                  department and its associated
                                                  HOD account. This cannot be
                                                  undone.
                                              </p>
                                              <DialogFooter>
                                                  <DialogClose asChild>
                                                      <Button variant="outline">
                                                          Cancel
                                                      </Button>
                                                  </DialogClose>
                                                  <DialogClose asChild>
                                                      <Button
                                                          variant="destructive"
                                                          onClick={() =>
                                                              handleDelete(
                                                                  dept._id
                                                              )
                                                          }
                                                      >
                                                          Delete
                                                      </Button>
                                                  </DialogClose>
                                              </DialogFooter>
                                          </DialogContent>
                                      </Dialog>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <UserCheck className="w-4 h-4" />
                                      <span>
                                          HOD:{" "}
                                          {dept.hod?.name ||
                                              "Not Assigned"}
                                      </span>
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {!isLoading && departments.length === 0 && (
                <div className="col-span-full mt-10">
                    <Card className="w-full">
                        <CardContent className="text-center py-12">
                            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No Departments Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Click the button below to add your first
                                department.
                            </p>
                            <Button onClick={handleAddNew}>
                                <Plus className="w-4 h-4 mr-2" /> Add First
                                Department
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DepartmentPage;
