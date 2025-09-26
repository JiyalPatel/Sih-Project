import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const GenerateTimetablePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleGenerateClick = async () => {
        setIsLoading(true);
        setIsSuccess(false);
        try {
            // Make the API call to our new backend endpoint
            const response = await api.post("/generate");

            if (response.status === 201) {
                setIsSuccess(true);
                toast({
                    title: "Success!",
                    description: "New timetable has been generated and saved.",
                });
            }
        } catch (error) {
            console.error("Failed to generate timetable:", error);
            toast({
                title: "Error",
                description: "Failed to generate timetable. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Generate New Timetable</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground">
                        Click the button below to start the generation process. This may take a few moments.
                    </p>
                    <Button
                        onClick={handleGenerateClick}
                        disabled={isLoading}
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Hourglass className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Start Generation"
                        )}
                    </Button>
                    {isSuccess && (
                        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md flex items-center">
                            <CheckCircle className="mr-2" />
                            <span>Timetable generated successfully!</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GenerateTimetablePage;