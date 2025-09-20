import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TimetableGrid from "@/components/Timetable/TimetableGrid";
import { Calendar, Download, Edit, Save, Filter } from "lucide-react";

const TimetablePage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const departments = [
    "Computer Science Engineering",
    "Information Technology", 
    "Electronics & Telecommunication",
    "Mechanical Engineering"
  ];

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would save the timetable changes
  };

  const handleExport = () => {
    // Here you would export the timetable
    console.log("Exporting timetable...");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timetable Management</h1>
          <p className="text-muted-foreground">View and manage academic timetables</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "default" : "outline"}
            className={isEditing ? "btn-secondary" : ""}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "Exit Edit" : "Edit Mode"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
              <label className="text-sm font-medium">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
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

            <div className="flex items-end">
              <Button className="w-full btn-primary">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Display */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Timetable
            {selectedDepartment && selectedSemester && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                • {selectedDepartment} - Semester {selectedSemester}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableGrid editable={isEditing} />
          
          {isEditing && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Edit Mode Instructions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click on any cell to edit the subject, faculty, or room details</li>
                <li>• Drag and drop to move subjects between time slots</li>
                <li>• Use the subject library on the right to add new subjects</li>
                <li>• Changes are automatically validated for conflicts</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">32</div>
            <div className="text-sm text-muted-foreground">Total Classes</div>
          </CardContent>
        </Card>
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">8</div>
            <div className="text-sm text-muted-foreground">Faculty Assigned</div>
          </CardContent>
        </Card>
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">5</div>
            <div className="text-sm text-muted-foreground">Free Periods</div>
          </CardContent>
        </Card>
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">2</div>
            <div className="text-sm text-muted-foreground">Conflicts</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetablePage;