import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import TimetableGrid from "@/components/Timetable/TimetableGrid";
import { Zap, Download, Save, RefreshCw, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GenerateTimetablePage = () => {
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedTimetable, setGeneratedTimetable] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const departments = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Telecommunication",
    "Mechanical Engineering"
  ];

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleGenerate = async () => {
    if (!selectedDepartment || !selectedSemester) {
      toast({
        title: "Missing Information",
        description: "Please select both department and semester.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setConflicts([]);

    // Simulate timetable generation process
    const progressSteps = [
      { step: 20, message: "Loading subjects and faculty..." },
      { step: 40, message: "Analyzing constraints..." },
      { step: 60, message: "Generating optimal schedule..." },
      { step: 80, message: "Checking for conflicts..." },
      { step: 100, message: "Finalizing timetable..." }
    ];

    for (const { step, message } of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(step);
      
      if (step === 80) {
        // Simulate potential conflicts
        const potentialConflicts = [
          "Dr. Smith has overlapping classes on Monday 10:00-11:00",
          "Room CS-101 is double-booked on Wednesday 2:00-3:00"
        ];
        
        if (Math.random() > 0.7) {
          setConflicts(potentialConflicts.slice(0, Math.floor(Math.random() * 2) + 1));
        }
      }
    }

    setIsGenerating(false);
    setGeneratedTimetable(true);

    toast({
      title: "Timetable Generated",
      description: conflicts.length > 0 
        ? `Timetable generated with ${conflicts.length} conflict(s) to resolve.`
        : "Timetable generated successfully without conflicts!",
    });
  };

  const handleSave = () => {
    toast({
      title: "Timetable Saved",
      description: "The generated timetable has been saved successfully.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Timetable is being exported to PDF...",
    });
  };

  const handleRegenerate = () => {
    setGeneratedTimetable(false);
    setConflicts([]);
    handleGenerate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate Timetable</h1>
          <p className="text-muted-foreground">Create optimized timetables using AI algorithms</p>
        </div>
        {generatedTimetable && (
          <div className="flex gap-3">
            <Button onClick={handleRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={handleSave} className="btn-secondary">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Configuration */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !selectedDepartment || !selectedSemester}
                className="w-full btn-hero"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Timetable
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="card-elevated animate-scale-in">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <h3 className="font-semibold text-foreground">Generating Timetable...</h3>
              </div>
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {generationProgress < 20 && "Loading subjects and faculty..."}
                {generationProgress >= 20 && generationProgress < 40 && "Analyzing constraints..."}
                {generationProgress >= 40 && generationProgress < 60 && "Generating optimal schedule..."}
                {generationProgress >= 60 && generationProgress < 80 && "Checking for conflicts..."}
                {generationProgress >= 80 && "Finalizing timetable..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts Alert */}
      {generatedTimetable && conflicts.length > 0 && (
        <Card className="card-elevated border-warning/20 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Conflicts Detected</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The following conflicts were found in the generated timetable:
                </p>
                <ul className="space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index} className="text-sm text-foreground">
                      • {conflict}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="btn-warning">
                    Resolve Conflicts
                  </Button>
                  <Button size="sm" variant="outline">
                    Ignore & Continue
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {generatedTimetable && conflicts.length === 0 && (
        <Card className="card-elevated border-success/20 bg-success/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <h3 className="font-semibold text-foreground">Timetable Generated Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  No conflicts detected. The timetable is ready for use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Timetable */}
      {generatedTimetable && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Generated Timetable
              <span className="text-sm font-normal text-muted-foreground ml-2">
                • {selectedDepartment} - Semester {selectedSemester}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid />
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {generatedTimetable && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-flat">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Efficiency Score</div>
            </CardContent>
          </Card>
          <Card className="card-flat">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">32</div>
              <div className="text-sm text-muted-foreground">Classes Scheduled</div>
            </CardContent>
          </Card>
          <Card className="card-flat">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">5</div>
              <div className="text-sm text-muted-foreground">Free Periods</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GenerateTimetablePage;