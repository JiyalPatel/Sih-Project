import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Building, MapPin, Globe, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// Interface based on your backend institute.model.js
interface Institute {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  website: string;
}

const InstitutePage = () => {
  const { toast } = useToast();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  
  const initialFormData = {
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactNumber: "",
    website: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // --- API Integration ---

  // Fetch all institutes
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

  // Handle form submission (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInstitute) {
        // Update existing institute
        const response = await api.put(`/institutes/${editingInstitute._id}`, formData);
        setInstitutes(institutes.map(inst => 
          inst._id === editingInstitute._id ? response.data : inst
        ));
        toast({ title: "Success", description: "Institute updated successfully." });
      } else {
        // Create new institute
        const response = await api.post("/institutes", formData);
        setInstitutes([...institutes, response.data]);
        toast({ title: "Success", description: "Institute added successfully." });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while saving the institute.",
        variant: "destructive",
      });
    }
  };

  // Handle delete
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
    setFormData({
      name: institute.name,
      address: institute.address,
      city: institute.city,
      state: institute.state,
      pincode: institute.pincode,
      contactNumber: institute.contactNumber,
      website: institute.website,
    });
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
          <p className="text-muted-foreground">Add, edit, and manage all institutes.</p>
        </div>
        <Button onClick={handleAddNew} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Institute
        </Button>
      </div>

      {showAddForm && (
        <Card className="card-elevated animate-scale-in">
          <CardHeader>
            <CardTitle>{editingInstitute ? "Edit Institute" : "Add New Institute"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Institute Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., National Institute of Technology" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Campus Address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="e.g., Surat" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="e.g., Gujarat" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} placeholder="e.g., 395007" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} placeholder="e.g., +91 98765 43210" required />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://www.example.com" required />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" className="btn-primary">{editingInstitute ? "Update Institute" : "Add Institute"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)
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
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <span>{`${institute.address}, ${institute.city}, ${institute.state} - ${institute.pincode}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{institute.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={institute.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{institute.website}</a>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(institute)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" /> Edit
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
