import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import TimetableGrid from "@/components/Timetable/TimetableGrid";
import { Zap, Download, Save, RefreshCw, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api"; // ✅ uses your centralized API helper

// ---------- Types ----------
interface Department {
  _id: string;
  name: string;
}

interface Conflict {
  message: string;
}

interface TimetableResponse {
  timetable: any;        // Replace with your real Timetable type if available
  conflicts?: Conflict[];
  msg?: string;
}

const GenerateTimetablePage: React.FC = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>(""); // odd | even
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedTimetable, setGeneratedTimetable] = useState<any | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // ----- Fetch departments from DB -----
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data); // expecting [{ _id, name }, ...]
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load departments",
          variant: "destructive",
        });
      }
    };
    fetchDepartments();
  }, [toast]);

  // ----- Generate timetable -----
  const handleGenerate = async () => {
    if (!selectedDepartment || !selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select both department and term.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(10);

      const updateProgress = (val: number) =>
        setGenerationProgress(prev => (val > prev ? val : prev));
      updateProgress(30);

      const res = await api.post("/generate", {
        departmentId: selectedDepartment,
        term: selectedTerm, // "odd" | "even"
      });

      updateProgress(70);

      const data: TimetableResponse = res.data;
      setGeneratedTimetable(data.timetable);
      setConflicts(data.conflicts || []);
      updateProgress(100);

      toast({
        title: "Timetable Generated",
        description:
          data.conflicts?.length
            ? `${data.conflicts.length} conflict(s) detected.`
            : "Successfully generated with no conflicts!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate timetable",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    toast({ title: "Timetable Saved", description: "Timetable saved successfully." });
  };

  const handleExport = () => {
    toast({ title: "Export Started", description: "Exporting timetable to PDF..." });
  };

  const handleRegenerate = () => {
    setGeneratedTimetable(null);
    setConflicts([]);
    setGenerationProgress(0);
    handleGenerate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Generate Timetable</h1>
          <p className="text-muted-foreground">Create optimized timetables using AI scheduling</p>
        </div>
        {generatedTimetable && (
          <div className="flex gap-3">
            <Button onClick={handleRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button onClick={handleSave} className="btn-secondary">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        )}
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="odd">Odd Term</SelectItem>
                  <SelectItem value="even">Even Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full btn-hero"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" /> Generate Timetable
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">Generating timetable...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {generatedTimetable && conflicts.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Conflicts Detected</h3>
                <ul className="list-disc pl-5 text-sm">
                  {conflicts.map((c, idx) => (
                    <li key={idx}>{c.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {generatedTimetable && conflicts.length === 0 && (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-6 flex gap-3 items-center">
            <CheckCircle className="w-5 h-5 text-success" />
            <span>Timetable generated successfully with no conflicts!</span>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      {generatedTimetable && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Zap className="w-5 h-5 text-primary inline-block mr-2" />
              Generated Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid data={generatedTimetable} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GenerateTimetablePage;
