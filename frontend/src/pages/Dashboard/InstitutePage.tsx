import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Building, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Interface updated to match your exact backend model and populated data
interface Institute {
  _id: string;
  name: string;
  institute_acc: { // This field is populated from your backend
    _id: string;
    email: string;
  };
  integrationLink: string;
}

const InstitutePage = () => {
  const { toast } = useToast();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  
  // 2. Simplified form data state
  const initialFormData = {
    name: "",
    email: "",
    password: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // --- API Integration ---

  useEffect(() => {
    const fetchInstitutes = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/institutes");
        setInstitutes(response.data);
      } catch (error) {
        toast({
          title: "Error fetching institutes",
          description: "Could not load the list of institutes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstitutes();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInstitute) {
        // UPDATE: Only the 'name' is editable
        const response = await api.put(`/institutes/${editingInstitute._id}`, { name: formData.name });
        setInstitutes(institutes.map(inst => 
          inst._id === editingInstitute._id ? response.data : inst
        ));
        toast({ title: "Success", description: "Institute name updated successfully." });
      } else {
        // CREATE: Send the required payload
        const response = await api.post("/institutes", formData);
        // 3. Correctly handle the nested response structure
        setInstitutes([...institutes, response.data.institute]);
        toast({ title: "Success", description: response.data.msg });
      }
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/institutes/${id}`);
      setInstitutes(institutes.filter(inst => inst._id !== id));
      toast({ title: "Success", description: "Institute deleted successfully." });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "An error occurred while deleting the institute.",
        variant: "destructive",
      });
    }
  };

  // --- Helper Functions ---
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingInstitute(null);
    setShowAddForm(false);
  };

  const handleEdit = (institute: Institute) => {
    setEditingInstitute(institute);
    setFormData({ ...initialFormData, name: institute.name });
    setShowAddForm(true);
  };
  
  const handleAddNew = () => {
    setEditingInstitute(null);
    setFormData(initialFormData);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institute Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage institute accounts.</p>
        </div>
        <Button onClick={handleAddNew} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Institute
        </Button>
      </div>

      {showAddForm && (
        <Card className="card-elevated animate-scale-in">
          <CardHeader>
            <CardTitle>{editingInstitute ? "Edit Institute Name" : "Add New Institute"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Institute Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., National Institute of Technology" required />
              </div>

              {/* Fields are only shown when creating a new institute */}
              {!editingInstitute && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="admin@institute.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Admin Password</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Enter a strong password" required />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="btn-primary">{editingInstitute ? "Update Name" : "Create Institute"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 4. Simplified Institute Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)
        ) : (
          institutes.map((institute) => (
            <Card key={institute._id} className="card-elevated hover:scale-105 transition-transform duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  {institute.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {/* Display the populated email */}
                    <span className="truncate">{institute.institute_acc?.email || "No email"}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(institute)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" /> Edit Name
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(institute._id)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

       {/* Empty State */}
       {!isLoading && institutes.length === 0 && (
          <div className="col-span-full">
            <Card className="card-flat">
              <CardContent className="text-center py-12">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Institutes Found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first institute.</p>
                <Button onClick={handleAddNew} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" /> Add First Institute
                </Button>
              </CardContent>
            </Card>
          </div>
       )}
    </div>
  );
};

export default InstitutePage;
