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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Mail, Building, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// --- Interfaces to match backend models ---
interface Department {
    _id: string;
    name: string;
    institute: {_id:string};
}

interface Faculty {
    _id: string;
    fac_acc: {
        // Populated from User model
        _id: string;
        name: string;
        email: string;
    };
    department: Department; // Populated from Department model
    specialization: string[];
    institute: string;
}

interface Institute {
    _id: string;
    institute_acc: {
        _id: string;
    };
}

const FacultyPage = () => {
    const { toast } = useToast();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [actualInstituteId, setActualInstituteId] = useState<string | null>(
        null
    );

    const initialFormData = {
        name: "",
        email: "",
        password: "",
        departmentId: "",
        specialization: "", // Will be a comma-separated string in the form
    };
    const [formData, setFormData] = useState(initialFormData);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const instituteAccountId = user?._id;

    // --- Data Fetching and Management ---

    const fetchData = useCallback(
        async (instituteId: string) => {
            setIsLoading(true);
            try {
                const [facultyRes, deptRes] = await Promise.all([
                    api.get(`/faculties`),
                    api.get(`/departments`),
                ]);

                const allFaculties: Faculty[] = facultyRes.data;
                const allDepartments: Department[] = deptRes.data;

                const instituteFaculty = allFaculties
                
                const instituteDepartments = allDepartments.filter(
                    (d) => d.institute._id === instituteId
                );

                setFaculties(instituteFaculty);
                setDepartments(instituteDepartments);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({
                    title: "Error",
                    description: "Could not load faculty or department data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        const findInstituteAndFetchData = async () => {
            if (!instituteAccountId) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await api.get("/institutes");
                const matchingInstitute = res.data.find(
                    (inst: Institute) =>
                        inst.institute_acc._id === instituteAccountId
                );
                if (matchingInstitute) {
                    setActualInstituteId(matchingInstitute._id);
                    await fetchData(matchingInstitute._id);
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
        findInstituteAndFetchData();
    }, [instituteAccountId, fetchData, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actualInstituteId) {
            toast({
                title: "Error",
                description: "Institute ID is missing.",
                variant: "destructive",
            });
            return;
        }

        // Convert comma-separated string to array for the payload
        const specializationArray = formData.specialization
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);

        try {
            if (editingFaculty) {
                const payload = {
                    name: formData.name,
                    departmentId: formData.departmentId,
                    specialization: specializationArray,
                };
                await api.put(`/faculties/${editingFaculty._id}`, payload);
                toast({
                    title: "Success",
                    description: "Faculty member updated successfully.",
                });
            } else {
                const payload = {
                    ...formData,
                    specialization: specializationArray,
                    instituteId: actualInstituteId,
                };
                await api.post("/faculties", payload);
                toast({
                    title: "Success",
                    description: "Faculty member and user account created.",
                });
            }
            resetForm();
            await fetchData(actualInstituteId);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to save faculty member.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (facultyId: string) => {
        try {
            await api.delete(`/faculties/${facultyId}`);
            setFaculties(faculties.filter((f) => f._id !== facultyId));
            toast({ title: "Success", description: "Faculty member deleted." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete faculty member.",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingFaculty(null);
        setShowForm(false);
    };

    const handleEdit = (faculty: Faculty) => {
        setEditingFaculty(faculty);
        setFormData({
            ...initialFormData,
            name: faculty.fac_acc.name,
            email: faculty.fac_acc.email,
            departmentId: faculty.department._id,
            specialization: faculty.specialization.join(", "),
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingFaculty(null);
        setFormData(initialFormData);
        setShowForm(true);
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Faculty Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage faculty members and their user accounts.
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="w-4 h-4 mr-2" /> Add Faculty
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingFaculty
                                ? "Edit Faculty Member"
                                : "Add New Faculty Member"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Dr. Jane Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="faculty@institute.com"
                                    required
                                    disabled={!!editingFaculty}
                                />
                            </div>
                            {!editingFaculty && (
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Create a strong password"
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Select
                                    value={formData.departmentId}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            departmentId: value,
                                        })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem
                                                key={dept._id}
                                                value={dept._id}
                                            >
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="specialization">
                                    Specialization (comma-separated)
                                </Label>
                                <Input
                                    id="specialization"
                                    value={formData.specialization}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specialization: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., AI, Databases, Networks"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-3 pt-4">
                                <Button type="submit">
                                    {editingFaculty
                                        ? "Save Changes"
                                        : "Create Faculty"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-56 rounded-lg" />
                      ))
                    : faculties.map((faculty) => (
                          <Card
                              key={faculty._id}
                              className="hover:shadow-lg transition-shadow"
                          >
                              <CardHeader>
                                  <CardTitle>{faculty.fac_acc.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                      {faculty.department?.name ||
                                          "No Department"}
                                  </p>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                      <Mail className="w-4 h-4 text-muted-foreground" />{" "}
                                      <span className="truncate">
                                          {faculty.fac_acc.email}
                                      </span>
                                  </div>
                                  <div className="text-sm pt-2">
                                      <p className="font-semibold mb-1">
                                          Specializations:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                          {faculty.specialization.map(
                                              (spec) => (
                                                  <span
                                                      key={spec}
                                                      className="bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full"
                                                  >
                                                      {spec}
                                                  </span>
                                              )
                                          )}
                                      </div>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                      <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEdit(faculty)}
                                          className="flex-1"
                                      >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                      </Button>
                                      <Dialog>
                                          <DialogTrigger asChild>
                                              <Button
                                                  size="icon"
                                                  variant="destructive"
                                                  className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                              >
                                                  <Trash2 className="w-4 h-4" />
                                              </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                              <DialogHeader>
                                                  <DialogTitle>
                                                      Are you sure?
                                                  </DialogTitle>
                                              </DialogHeader>
                                              <p>
                                                  This will permanently delete
                                                  the faculty member{" "}
                                                  <strong>
                                                      {faculty.fac_acc.name}
                                                  </strong>{" "}
                                                  and their associated user
                                                  account.
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
                                                                  faculty._id
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
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {!isLoading && faculties.length === 0 && (
                <div className="col-span-full mt-10 text-center">
                    <Card>
                        <CardContent className="p-12">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No Faculty Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Click the button below to add your first faculty
                                member.
                            </p>
                            <Button onClick={handleAddNew}>
                                <Plus className="w-4 h-4 mr-2" /> Add First
                                Faculty
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FacultyPage;
