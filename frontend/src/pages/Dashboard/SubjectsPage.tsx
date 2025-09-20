import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, BookOpen, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
  type: "theory" | "lab" | "tutorial";
  faculty: string;
}

const SubjectsPage = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: "1",
      name: "Data Structures and Algorithms",
      code: "CS201",
      department: "Computer Science",
      semester: "3",
      credits: 4,
      type: "theory",
      faculty: "Dr. Smith"
    },
    {
      id: "2",
      name: "Database Management Lab",
      code: "CS202L",
      department: "Computer Science",
      semester: "3",
      credits: 2,
      type: "lab",
      faculty: "Dr. Johnson"
    },
    {
      id: "3",
      name: "Web Development",
      code: "CS301",
      department: "Computer Science",
      semester: "5",
      credits: 3,
      type: "theory",
      faculty: "Prof. Davis"
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    department: string;
    semester: string;
    credits: number;
    type: "theory" | "lab" | "tutorial";
    faculty: string;
  }>({
    name: "",
    code: "",
    department: "",
    semester: "",
    credits: 0,
    type: "theory",
    faculty: ""
  });

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const subjectTypes = ["theory", "lab", "tutorial"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubject) {
      setSubjects(subjects.map(subject => 
        subject.id === editingSubject.id 
          ? { ...editingSubject, ...formData }
          : subject
      ));
      toast({
        title: "Subject Updated",
        description: "Subject has been updated successfully.",
      });
      setEditingSubject(null);
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...formData
      };
      setSubjects([...subjects, newSubject]);
      toast({
        title: "Subject Added",
        description: "New subject has been added successfully.",
      });
    }
    
    setFormData({
      name: "",
      code: "",
      department: "",
      semester: "",
      credits: 0,
      type: "theory",
      faculty: ""
    });
    setShowAddForm(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      department: subject.department,
      semester: subject.semester,
      credits: subject.credits,
      type: subject.type,
      faculty: subject.faculty
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    toast({
      title: "Subject Deleted",
      description: "Subject has been removed successfully.",
      variant: "destructive",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "theory":
        return "bg-primary/10 text-primary";
      case "lab":
        return "bg-secondary/10 text-secondary";
      case "tutorial":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects Management</h1>
          <p className="text-muted-foreground">Manage academic subjects and their details</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="card-elevated animate-scale-in">
          <CardHeader>
            <CardTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter subject name"
                  className="form-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g., CS201"
                  className="form-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({...formData, department: value})}
                >
                  <SelectTrigger className="form-select">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={formData.semester} 
                  onValueChange={(value) => setFormData({...formData, semester: value})}
                >
                  <SelectTrigger className="form-select">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                  placeholder="e.g., 4"
                  className="form-input"
                  min="1"
                  max="6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "theory" | "lab" | "tutorial") => setFormData({...formData, type: value})}
                >
                  <SelectTrigger className="form-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  value={formData.faculty}
                  onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                  placeholder="Enter faculty name"
                  className="form-input"
                  required
                />
              </div>

              <div className="space-y-2">
                {/* Empty space for alignment */}
              </div>

              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" className="btn-primary">
                  {editingSubject ? "Update Subject" : "Add Subject"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSubject(null);
                    setFormData({
                      name: "",
                      code: "",
                      department: "",
                      semester: "",
                      credits: 0,
                      type: "theory",
                      faculty: ""
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="card-elevated hover:scale-105 transition-transform duration-200">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{subject.code}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(subject.type)}`}>
                  {subject.type}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{subject.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Semester {subject.semester} • {subject.credits} Credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{subject.faculty}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(subject)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(subject.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <Card className="card-flat">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Subjects Found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first subject.</p>
            <Button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add First Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubjectsPage;