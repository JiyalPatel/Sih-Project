import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api"; // <-- shared axios instance (with baseURL etc.)

interface Department {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  name: string;
  classNum: string;
  type: "lab" | "lecture";
  capacity: number;
  department?: Department;
  avail_days: string[];
  avail_slots: string[];
}

const daysOptions = ["mon", "tue", "wed", "thu", "fri", "sat"];
const slotsOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

export default function RoomPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [form, setForm] = useState({
    name: "",
    classNum: "",
    type: "",
    capacity: 0,
    department: "",
    avail_days: [...daysOptions],
    avail_slots: [...slotsOptions],
  });

  // ---- Fetch all rooms + departments ----
  useEffect(() => {
    fetchRooms();
    fetchDepartments();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ---- Handlers ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, form);
        toast({ title: "Room Updated", description: "Room updated successfully." });
      } else {
        await api.post("/rooms", form);
        toast({ title: "Room Added", description: "New room created." });
      }
      setShowForm(false);
      setEditingRoom(null);
      resetForm();
      fetchRooms();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      classNum: room.classNum,
      type: room.type,
      capacity: room.capacity,
      department: room.department?._id || "",
      avail_days: room.avail_days,
      avail_slots: room.avail_slots,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/rooms/${id}`);
      toast({ title: "Room Deleted", description: "Room removed successfully." });
      fetchRooms();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const resetForm = () =>
    setForm({
      name: "",
      classNum: "",
      type: "",
      capacity: 0,
      department: "",
      avail_days: [...daysOptions],
      avail_slots: [...slotsOptions],
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">
            Manage classrooms/labs and their availability
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>{editingRoom ? "Edit Room" : "Add New Room"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="classNum">Class Number</Label>
                <Input
                  id="classNum"
                  value={form.classNum}
                  onChange={(e) => setForm({ ...form, classNum: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="lecture">Lecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* You can later add multi-select UI for days/slots if needed */}

              <div className="md:col-span-2 flex gap-3 mt-4">
                <Button type="submit">
                  {editingRoom ? "Update Room" : "Add Room"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
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

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room._id} className="hover:shadow-md transition">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{room.name}</CardTitle>
                <span className="text-sm text-muted-foreground">{room.type}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Class #: {room.classNum}</div>
              <div>Capacity: {room.capacity}</div>
              {room.department && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  {room.department.name}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(room)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(room._id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No rooms found. Add your first room to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
