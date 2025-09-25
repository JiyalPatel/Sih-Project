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
import { Switch } from "@/components/ui/switch";
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    Users,
    Hash,
    Clock,
    Star,
    Building,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// --- Interfaces to match backend models & populated data ---
interface Department {
    _id: string;
    name: string;
    institute: { _id: string };
}

interface Faculty {
    _id: string;
    fac_acc: {
        _id: string;
        name: string;
    };
    institute: string;
}

interface Subject {
    _id: string;
    name: string;
    subjectCode: string;
    semester: number;
    isLab: boolean;
    credits: number;
    hours_per_week: number;
    department: string // Populated from Department model
    faculty?: Faculty; // Optional and populated
}

interface Institute {
    _id: string;
    institute_acc: {
        _id: string;
    };
}



const SubjectsPage = () => {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [actualInstituteId, setActualInstituteId] = useState<string | null>(
        null
    );

    const initialFormData = {
        name: "",
        subjectCode: "",
        department: "",
        semester: 1,
        isLab: false,
        credits: 0,
        faculty: "",
        hours_per_week: 0,
    };
    const [formData, setFormData] = useState(initialFormData);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const instituteAccountId = user?._id;

    // --- Data Fetching and Management ---

    const fetchData = useCallback(
        async (instituteId: string) => {
            setIsLoading(true);
            try {
                const [subjectRes, deptRes, facultyRes] = await Promise.all([
                    api.get(`/subjects`),
                    api.get(`/departments`),
                    api.get(`/faculties`),
                ]);

                const allSubjects: Subject[] = subjectRes.data;
                const allDepartments: Department[] = deptRes.data;
                const allFaculties: Faculty[] = facultyRes.data;

                const instituteDepartments = allDepartments.filter(
                    (d) => d.institute._id === instituteId
                );
                const instituteFaculties = allFaculties;

                const departmentIdSet = new Set(
                    instituteDepartments.map((d) => d._id)
                );
                // A subject belongs to the institute if its department is in the institute's department list
                const instituteSubjects = allSubjects.filter((s) =>
                    departmentIdSet.has(s.department)
                );

                setSubjects(instituteSubjects);
                setDepartments(instituteDepartments);
                setFaculties(instituteFaculties);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({
                    title: "Error",
                    description: "Could not load required data.",
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
        if (!formData.department) {
            toast({
                title: "Validation Error",
                description: "Please select a department.",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            ...formData,
            faculty: formData.faculty || undefined, // Send undefined if no faculty is selected, so it's excluded from the payload
        };

        try {
            if (editingSubject) {
                await api.put(`/subjects/${editingSubject._id}`, payload);
                toast({
                    title: "Success",
                    description: "Subject updated successfully.",
                });
            } else {
                await api.post("/subjects", payload);
                toast({
                    title: "Success",
                    description: "Subject created successfully.",
                });
            }
            resetForm();
            if (actualInstituteId) await fetchData(actualInstituteId);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to save subject.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (subjectId: string) => {
        try {
            await api.delete(`/subjects/${subjectId}`);
            setSubjects(subjects.filter((s) => s._id !== subjectId));
            toast({ title: "Success", description: "Subject deleted." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete subject.",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingSubject(null);
        setShowForm(false);
    };

    const handleEdit = (subject: Subject) => {
        setEditingSubject(subject);
        setFormData({
            name: subject.name,
            subjectCode: subject.subjectCode,
            department: subject.department,
            semester: subject.semester,
            isLab: subject.isLab,
            credits: subject.credits,
            faculty: subject.faculty?._id || "",
            hours_per_week: subject.hours_per_week,
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingSubject(null);
        setFormData(initialFormData);
        setShowForm(true);
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Subject Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage all subjects offered in your institute.
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="w-4 h-4 mr-2" /> Add Subject
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingSubject
                                ? "Edit Subject"
                                : "Add New Subject"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Subject Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Data Structures"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subjectCode">
                                    Subject Code
                                </Label>
                                <Input
                                    id="subjectCode"
                                    value={formData.subjectCode}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            subjectCode: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., CS201"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Select
                                    value={formData.department}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            department: value,
                                        })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
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
                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Input
                                    id="semester"
                                    type="number"
                                    value={formData.semester}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            semester:
                                                parseInt(e.target.value) || 1,
                                        })
                                    }
                                    min="1"
                                    max="8"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="credits">Credits</Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    value={formData.credits}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            credits:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hours_per_week">
                                    Hours per Week
                                </Label>
                                <Input
                                    id="hours_per_week"
                                    type="number"
                                    value={formData.hours_per_week}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            hours_per_week:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="faculty">
                                    Assign Faculty (Optional)
                                </Label>
                                <Select
                                    value={formData.faculty}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            faculty: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Faculty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculties.map((fac) => (
                                            <SelectItem
                                                key={fac._id}
                                                value={fac._id}
                                            >
                                                {fac.fac_acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch
                                    id="isLab"
                                    checked={formData.isLab}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isLab: checked,
                                        })
                                    }
                                />
                                <Label htmlFor="isLab">
                                    This is a Lab/Practical Subject
                                </Label>
                            </div>
                            <div className="lg:col-span-3 flex gap-3 pt-4">
                                <Button type="submit">
                                    {editingSubject
                                        ? "Save Changes"
                                        : "Create Subject"}
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
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-56 rounded-lg" />
                      ))
                    : subjects.map((subject) => (
                          <Card
                              key={subject._id}
                              className="hover:shadow-lg transition-shadow"
                          >
                              <CardHeader>
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <CardTitle>{subject.name}</CardTitle>
                                          <p className="text-sm text-muted-foreground">
                                               {departments.find((d) => d._id === subject.department)?.name || "Unknown"}
                                          </p>
                                      </div>
                                      <span
                                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                                              subject.isLab
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-green-100 text-green-800"
                                          }`}
                                      >
                                          {subject.isLab ? "Lab" : "Theory"}
                                      </span>
                                  </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                      <Hash className="w-4 h-4 text-muted-foreground" />{" "}
                                      <span>{subject.subjectCode}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                      <Users className="w-4 h-4 text-muted-foreground" />{" "}
                                      <span>
                                          Faculty:{" "}
                                          {subject.faculty?.fac_acc.name ||
                                              "Not Assigned"}
                                      </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                      <Clock className="w-4 h-4 text-muted-foreground" />{" "}
                                      <span>Semester {subject.semester}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                      <Star className="w-4 h-4 text-muted-foreground" />{" "}
                                      <span>
                                          {subject.credits} Credits /{" "}
                                          {subject.hours_per_week} Hours per
                                          Week
                                      </span>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                      <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEdit(subject)}
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
                                                  the subject{" "}
                                                  <strong>
                                                      {subject.name}
                                                  </strong>
                                                  . This action cannot be
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
                                                                  subject._id
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

            {!isLoading && subjects.length === 0 && (
                <div className="col-span-full mt-10 text-center">
                    <Card>
                        <CardContent className="p-12">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No Subjects Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Click the button below to add your first
                                subject.
                            </p>
                            <Button onClick={handleAddNew}>
                                <Plus className="w-4 h-4 mr-2" /> Add First
                                Subject
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SubjectsPage;
