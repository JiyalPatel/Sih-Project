import { Card } from "@/components/ui/card";

interface TimetableSlot {
  id: string;
  subject: string;
  faculty: string;
  room?: string;
  type?: "lecture" | "lab" | "tutorial";
}

interface TimetableGridProps {
  data?: TimetableSlot[][];
  editable?: boolean;
  compact?: boolean;
}

const TimetableGrid = ({ data, editable = false, compact = false }: TimetableGridProps) => {
  const timeSlots = [
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-1:00",
    "1:00-2:00",
    "2:00-3:00",
    "3:00-4:00",
    "4:00-5:00"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Sample data if none provided
  const sampleData = [
    [
      { id: "1", subject: "Data Structures", faculty: "Dr. Smith", room: "CS-101", type: "lecture" as const },
      { id: "2", subject: "Database Systems", faculty: "Dr. Johnson", room: "CS-102", type: "lecture" as const },
      { id: "3", subject: "", faculty: "", room: "", type: "lecture" as const },
      { id: "4", subject: "Lunch Break", faculty: "", room: "", type: "lecture" as const },
      { id: "5", subject: "Web Development", faculty: "Prof. Davis", room: "CS-103", type: "lab" as const },
      { id: "6", subject: "Software Engineering", faculty: "Dr. Wilson", room: "CS-104", type: "lecture" as const },
      { id: "7", subject: "", faculty: "", room: "", type: "lecture" as const },
      { id: "8", subject: "", faculty: "", room: "", type: "lecture" as const },
    ],
    // ... repeat for other days
  ];

  const timetableData = data || Array(5).fill(sampleData[0]);

  const getSlotTypeColor = (type?: string) => {
    switch (type) {
      case "lecture":
        return "bg-primary/10 border-primary/20";
      case "lab":
        return "bg-secondary/10 border-secondary/20";
      case "tutorial":
        return "bg-accent/10 border-accent/20";
      default:
        return "bg-muted/30 border-border";
    }
  };

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-9 gap-2">
          {/* Header Row */}
          <div className="timetable-header">Time / Day</div>
          {timeSlots.map((time) => (
            <div key={time} className="timetable-header text-xs">
              {time}
            </div>
          ))}

          {/* Timetable Rows */}
          {days.map((day, dayIndex) => (
            <div key={day} className="contents">
              {/* Day Header */}
              <div className="timetable-header">{compact ? day.slice(0, 3) : day}</div>
              
              {/* Time Slots */}
              {timetableData[dayIndex]?.map((slot, slotIndex) => (
                <div
                  key={`${day}-${slotIndex}`}
                  className={`
                    timetable-cell
                    ${getSlotTypeColor(slot.type)}
                    ${editable ? 'cursor-pointer hover:scale-105' : ''}
                    ${slot.subject === "Lunch Break" ? 'bg-warning/10 border-warning/20' : ''}
                  `}
                >
                  {slot.subject && (
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground text-xs">
                        {compact && slot.subject.length > 15 
                          ? slot.subject.slice(0, 15) + "..." 
                          : slot.subject
                        }
                      </div>
                      {slot.faculty && (
                        <div className="text-xs text-muted-foreground">
                          {compact && slot.faculty.length > 12 
                            ? slot.faculty.slice(0, 12) + "..." 
                            : slot.faculty
                          }
                        </div>
                      )}
                      {slot.room && (
                        <div className="text-xs text-muted-foreground font-medium">
                          {slot.room}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/10 border border-primary/20 rounded"></div>
          <span>Lecture</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary/10 border border-secondary/20 rounded"></div>
          <span>Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent/10 border border-accent/20 rounded"></div>
          <span>Tutorial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warning/10 border border-warning/20 rounded"></div>
          <span>Break</span>
        </div>
      </div>
    </Card>
  );
};

export default TimetableGrid;