import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Mail, Phone, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  specialization: string;
  experience: number;
}

const FacultyPage = () => {
  const { toast } = useToast();
  const [faculties, setFaculties] = useState<Faculty[]>([
    {
      id: "1",
      name: "Dr. John Smith",
      email: "john.smith@university.edu",
      phone: "+1-234-567-8901",
      department: "Computer Science",
      designation: "Professor",
      specialization: "Data Structures, Algorithms",
      experience: 15
    },
    {
      id: "2",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      phone: "+1-234-567-8902",
      department: "Computer Science",
      designation: "Associate Professor",
      specialization: "Database Systems, Data Mining",
      experience: 12
    },
    {
      id: "3",
      name: "Prof. Michael Davis",
      email: "michael.davis@university.edu",
      phone: "+1-234-567-8903",
      department: "Information Technology",
      designation: "Assistant Professor",
      specialization: "Web Development, UI/UX",
      experience: 8
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    specialization: "",
    experience: 0
  });

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical"];
  const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFaculty) {
      setFaculties(faculties.map(faculty => 
        faculty.id === editingFaculty.id 
          ? { ...editingFaculty, ...formData }
          : faculty
      ));
      toast({
        title: "Faculty Updated",
        description: "Faculty member has been updated successfully.",
      });
      setEditingFaculty(null);
    } else {
      const newFaculty: Faculty = {
        id: Date.now().toString(),
        ...formData
      };
      setFaculties([...faculties, newFaculty]);
      toast({
        title: "Faculty Added",
        description: "New faculty member has been added successfully.",
      });
    }
    
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      specialization: "",
      experience: 0
    });
    setShowAddForm(false);
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone,
      department: faculty.department,
      designation: faculty.designation,
      specialization: faculty.specialization,
      experience: faculty.experience
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setFaculties(faculties.filter(faculty => faculty.id !== id));
    toast({
      title: "Faculty Deleted",
      description: "Faculty member has been removed successfully.",
      variant: "destructive",
    });
  };

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case "Professor":
        return "bg-primary/10 text-primary";
      case "Associate Professor":
        return "bg-secondary/10 text-secondary";
      case "Assistant Professor":
        return "bg-accent/10 text-accent";
      case "Lecturer":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">Manage faculty members and their information</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="card-elevated animate-scale-in">
          <CardHeader>
            <CardTitle>{editingFaculty ? "Edit Faculty" : "Add New Faculty"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  className="form-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  className="form-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
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
                <Label htmlFor="designation">Designation</Label>
                <Select 
                  value={formData.designation} 
                  onValueChange={(value) => setFormData({...formData, designation: value})}
                >
                  <SelectTrigger className="form-select">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((designation) => (
                      <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                  placeholder="e.g., 10"
                  className="form-input"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="e.g., Data Structures, Algorithms, Machine Learning"
                  className="form-input"
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" className="btn-primary">
                  {editingFaculty ? "Update Faculty" : "Add Faculty"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingFaculty(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      department: "",
                      designation: "",
                      specialization: "",
                      experience: 0
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

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map((faculty) => (
          <Card key={faculty.id} className="card-elevated hover:scale-105 transition-transform duration-200">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{faculty.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{faculty.department}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDesignationColor(faculty.designation)}`}>
                  {faculty.designation}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{faculty.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{faculty.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{faculty.experience} years experience</span>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium mb-1">Specialization:</p>
                  <p className="text-foreground">{faculty.specialization}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(faculty)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(faculty.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faculties.length === 0 && (
        <Card className="card-flat">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Faculty Found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first faculty member.</p>
            <Button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add First Faculty
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyPage;