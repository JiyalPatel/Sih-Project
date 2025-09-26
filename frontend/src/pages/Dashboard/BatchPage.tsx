import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Subject {
    _id: string;
    name: string;
    subjectCode: string;
    semester: number;
    isLab: boolean;
}

interface Department {
    _id: string;
    name: string;
}

interface Batch {
    _id: string;
    name: string;
    sem: number;
    strength: number;
    department: Department;
    subjects: Subject[];
    avail_days: string[];
    avail_slots: string[];
}

const daysOptions = [
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thu", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" },
];

const slotsOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

export default function BatchPage() {
    const { toast } = useToast();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

    const [form, setForm] = useState({
        name: "",
        sem: 1,
        strength: 0,
        department: "",
        subjects: [] as string[],
        avail_days: daysOptions.map((d) => d.value),
        avail_slots: [...slotsOptions],
    });

    // ---- Fetch all batches, subjects, departments ----
    useEffect(() => {
        fetchBatches();
        fetchSubjects();
        fetchDepartments();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await api.get("/batches");
            setBatches(res.data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.msg || err.message,
                variant: "destructive",
            });
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get("/subjects");
            setSubjects(res.data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.msg || err.message,
                variant: "destructive",
            });
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get("/departments");
            setDepartments(res.data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.msg || err.message,
                variant: "destructive",
            });
        }
    };

    // ---- Handlers ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.sem || !form.strength || !form.department) {
            toast({
                title: "Error",
                description:
                    "Name, semester, strength and department are required.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (editingBatch) {
                await api.put(`/batches/${editingBatch._id}`, form);
                toast({
                    title: "Batch Updated",
                    description: "Batch updated successfully.",
                });
            } else {
                await api.post("/batches", form);
                toast({
                    title: "Batch Added",
                    description: "New batch created successfully.",
                });
            }
            setShowForm(false);
            setEditingBatch(null);
            resetForm();
            fetchBatches();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.msg || err.message,
                variant: "destructive",
            });
        }
    };

    const handleEdit = (batch: Batch) => {
        setEditingBatch(batch);
        setForm({
            name: batch.name,
            sem: batch.sem,
            strength: batch.strength,
            department: batch.department._id,
            subjects: batch.subjects.map((s) => s._id),
            avail_days: batch.avail_days,
            avail_slots: batch.avail_slots,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this batch?")) return;

        try {
            await api.delete(`/batches/${id}`);
            toast({
                title: "Batch Deleted",
                description: "Batch removed successfully.",
            });
            fetchBatches();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.msg || err.message,
                variant: "destructive",
            });
        }
    };

    const resetForm = () =>
        setForm({
            name: "",
            sem: 1,
            strength: 0,
            department: "",
            subjects: [],
            avail_days: daysOptions.map((d) => d.value),
            avail_slots: [...slotsOptions],
        });

    const handleDayChange = (day: string, checked: boolean) => {
        if (checked) {
            setForm({ ...form, avail_days: [...form.avail_days, day] });
        } else {
            setForm({
                ...form,
                avail_days: form.avail_days.filter((d) => d !== day),
            });
        }
    };

    const handleSlotChange = (slot: string, checked: boolean) => {
        if (checked) {
            setForm({ ...form, avail_slots: [...form.avail_slots, slot] });
        } else {
            setForm({
                ...form,
                avail_slots: form.avail_slots.filter((s) => s !== slot),
            });
        }
    };

    const handleSubjectChange = (subjectId: string, checked: boolean) => {
        if (checked) {
            setForm({ ...form, subjects: [...form.subjects, subjectId] });
        } else {
            setForm({
                ...form,
                subjects: form.subjects.filter((s) => s !== subjectId),
            });
        }
    };

    const filteredSubjects = subjects.filter(
        (subject) => subject.semester === form.sem
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Batch Management</h1>
                    <p className="text-muted-foreground">
                        Manage student batches and their subjects
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(true);
                        resetForm();
                    }}
                    className="btn-hero"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Batch
                </Button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle>
                            {editingBatch ? "Edit Batch" : "Add New Batch"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <Label htmlFor="name">Batch Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., CSE-2024-A"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="sem">Semester</Label>
                                    <Select
                                        value={form.sem.toString()}
                                        onValueChange={(v) =>
                                            setForm({
                                                ...form,
                                                sem: parseInt(v),
                                                subjects: [],
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesterOptions.map((sem) => (
                                                <SelectItem
                                                    key={sem}
                                                    value={sem.toString()}
                                                >
                                                    Semester {sem}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="strength">
                                        Batch Strength
                                    </Label>
                                    <Input
                                        id="strength"
                                        type="number"
                                        placeholder="e.g., 60"
                                        value={form.strength}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                strength:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Department</Label>
                                    <Select
                                        value={form.department}
                                        onValueChange={(v) =>
                                            setForm({ ...form, department: v })
                                        }
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
                            </div>

                            {/* Subjects Selection */}
                            <div>
                                <Label>Subjects (Semester {form.sem})</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto border rounded-md p-4">
                                    {filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject) => (
                                            <div
                                                key={subject._id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`subject-${subject._id}`}
                                                    checked={form.subjects.includes(
                                                        subject._id
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleSubjectChange(
                                                            subject._id,
                                                            checked as boolean
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`subject-${subject._id}`}
                                                    className="text-sm font-medium leading-none"
                                                >
                                                    {subject.name}{" "}
                                                    {subject.isLab && (
                                                        <span className="text-blue-600">
                                                            (Lab)
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No subjects available for this
                                            semester
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Available Days */}
                            <div>
                                <Label>Available Days</Label>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
                                    {daysOptions.map((day) => (
                                        <div
                                            key={day.value}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`day-${day.value}`}
                                                checked={form.avail_days.includes(
                                                    day.value
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleDayChange(
                                                        day.value,
                                                        checked as boolean
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`day-${day.value}`}
                                                className="text-sm font-medium leading-none"
                                            >
                                                {day.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Available Slots */}
                            <div>
                                <Label>Available Time Slots</Label>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-2">
                                    {slotsOptions.map((slot) => (
                                        <div
                                            key={slot}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`slot-${slot}`}
                                                checked={form.avail_slots.includes(
                                                    slot
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleSlotChange(
                                                        slot,
                                                        checked as boolean
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`slot-${slot}`}
                                                className="text-sm font-medium leading-none"
                                            >
                                                Slot {slot}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="btn-primary">
                                    {editingBatch
                                        ? "Update Batch"
                                        : "Add Batch"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingBatch(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Batches List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                    <Card key={batch._id} className="card-hover transition-all">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">
                                    {batch.name}
                                </CardTitle>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    Sem {batch.sem}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>Strength: {batch.strength}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                <span>Subjects: {batch.subjects.length}</span>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Available Days:
                                </p>
                                <p className="text-xs">
                                    {batch.avail_days.join(", ")}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Available Slots:
                                </p>
                                <p className="text-xs">
                                    {batch.avail_slots.join(", ")}
                                </p>
                            </div>

                            <div className="flex gap-2 mt-4 pt-2 border-t">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(batch)}
                                >
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(batch._id)}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {batches.length === 0 && (
                <Card className="card-flat">
                    <CardContent className="py-10 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>
                            No batches found. Add your first batch to get
                            started.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
