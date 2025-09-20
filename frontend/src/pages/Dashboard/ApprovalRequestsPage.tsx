import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Filter, FileText, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  type: "timetable" | "subject" | "faculty" | "room";
  priority: "low" | "medium" | "high";
}

const ApprovalRequestsPage = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: "1",
      title: "New Timetable for CSE Semester 5",
      description: "Request to approve the newly generated timetable for Computer Science Engineering Semester 5",
      requestedBy: "Dr. Smith",
      department: "Computer Science",
      date: "2024-01-15",
      status: "pending",
      type: "timetable",
      priority: "high"
    },
    {
      id: "2",
      title: "Add New Subject - Machine Learning",
      description: "Request to add Machine Learning as a new elective subject for CSE students",
      requestedBy: "Prof. Johnson",
      department: "Computer Science",
      date: "2024-01-14",
      status: "pending",
      type: "subject",
      priority: "medium"
    },
    {
      id: "3",
      title: "Faculty Schedule Change",
      description: "Request to modify Dr. Davis's teaching schedule due to research commitments",
      requestedBy: "Dr. Davis",
      department: "Information Technology",
      date: "2024-01-13",
      status: "approved",
      type: "faculty",
      priority: "low"
    },
    {
      id: "4",
      title: "Room Allocation Change",
      description: "Request to change lab allocation for Database Systems lab from CS-101 to CS-201",
      requestedBy: "Dr. Wilson",
      department: "Computer Science",
      date: "2024-01-12",
      status: "pending",
      type: "room",
      priority: "medium"
    }
  ]);

  const handleApprove = (id: string) => {
    setRequests(requests.map(request => 
      request.id === id 
        ? { ...request, status: "approved" as const }
        : request
    ));
    toast({
      title: "Request Approved",
      description: "The request has been approved successfully.",
    });
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(request => 
      request.id === id 
        ? { ...request, status: "rejected" as const }
        : request
    ));
    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "timetable":
        return <Calendar className="w-4 h-4" />;
      case "subject":
        return <FileText className="w-4 h-4" />;
      case "faculty":
        return <User className="w-4 h-4" />;
      case "room":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approval Requests</h1>
          <p className="text-muted-foreground">Review and manage pending approval requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{approvedCount}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card className="card-flat">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{requests.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filter Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status as any)}
                size="sm"
                className={filter === status ? "btn-primary" : ""}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="card-elevated">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getTypeIcon(request.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(request.priority)}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="outline">
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                        <span>Requested by: {request.requestedBy}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{request.department}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(request.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === "pending" && (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="btn-primary"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {request.status !== "pending" && (
                  <div className="flex items-center gap-2 text-sm">
                    {request.status === "approved" ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="text-muted-foreground">
                      {request.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card className="card-flat">
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Found</h3>
            <p className="text-muted-foreground">
              {filter === "all" 
                ? "There are no approval requests at the moment." 
                : `No ${filter} requests found.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApprovalRequestsPage;