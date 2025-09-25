import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Layout/Header";
import TimetableGrid from "@/components/Timetable/TimetableGrid";
import { ChevronRight, MapPin, GraduationCap, Calendar } from "lucide-react";

const Home = () => {
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showTimetable, setShowTimetable] = useState(false);

  const institutes = [
    "MIT Academy of Engineering",
    "Pune Institute of Technology",
    "Bharati Vidyapeeth College",
    "PICT College",
  ];

  const departments = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Telecommunication",
    "Mechanical Engineering",
    "Civil Engineering",
  ];

  const semesters = [
    "Semester 1",
    "Semester 2", 
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  const handleViewTimetable = () => {
    if (selectedInstitute && selectedDepartment && selectedSemester) {
      setShowTimetable(true);
    }
  };

    const isLoggedIn = !!localStorage.getItem("token");


  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={!isLoggedIn} showDashboard={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto text-center">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground mb-6">
              Smart Classroom &
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Timetable Scheduler
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Efficiently manage and view academic schedules with our intelligent timetable system
            </p>
          </div>
        </div>
      </section>

      {/* Selection Steps */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-8">
            
            {/* Step 1: Institute Selection */}
            <Card className="card-elevated animate-fade-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <MapPin className="w-5 h-5 text-primary" />
                  Select Institute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedInstitute} onValueChange={setSelectedInstitute}>
                  <SelectTrigger className="form-select">
                    <SelectValue placeholder="Choose your institute" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutes.map((institute) => (
                      <SelectItem key={institute} value={institute}>
                        {institute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 2: Department Selection */}
            <Card className={`card-elevated animate-fade-up ${!selectedInstitute ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  Select Department / Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedDepartment} 
                  onValueChange={setSelectedDepartment}
                  disabled={!selectedInstitute}
                >
                  <SelectTrigger className="form-select">
                    <SelectValue placeholder="Choose your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 3: Semester Selection */}
            <Card className={`card-elevated animate-fade-up ${!selectedDepartment ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <Calendar className="w-5 h-5 text-accent" />
                  Select Semester
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedSemester} 
                  onValueChange={setSelectedSemester}
                  disabled={!selectedDepartment}
                >
                  <SelectTrigger className="form-select">
                    <SelectValue placeholder="Choose your semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* View Timetable Button */}
            {selectedInstitute && selectedDepartment && selectedSemester && (
              <div className="text-center animate-scale-in">
                <Button 
                  onClick={handleViewTimetable}
                  className="btn-hero"
                >
                  View Timetable
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timetable Display */}
      {showTimetable && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Your Timetable</h2>
              <p className="text-muted-foreground">
                {selectedInstitute} • {selectedDepartment} • {selectedSemester}
              </p>
            </div>
            <TimetableGrid compact />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Smart Classroom & Timetable Scheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;