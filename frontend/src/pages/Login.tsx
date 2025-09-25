import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Layout/Header";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [userType, setUserType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // const userTypes = [
    //     { value: "institute", label: "Institute Admin" },
    //     { value: "hod", label: "Head of Department" },
    //     { value: "dep-admin", label: "Department Admin" },
    //     { value: "faculty", label: "Faculty Member" },
    // ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });

            // Assuming the backend returns a token and user data in response.data
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/dashboard");
        } catch (err: any) {
            // Axios wraps the error response in err.response
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Something went wrong";
            console.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header showAuth={false} />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Login Card */}
                    <Card className="card-elevated animate-fade-up">
                        <CardHeader className="text-center pb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                Welcome Back
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Sign in to your Smart Classroom account
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="font-medium"
                                    >
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="form-input pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="font-medium"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            className="form-input pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* User Type
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="userType"
                                        className="font-medium"
                                    >
                                        User Type
                                    </Label>
                                    <Select
                                        value={userType}
                                        onValueChange={setUserType}
                                    >
                                        <SelectTrigger className="form-select">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userTypes.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div> */}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        "Signing In..."
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Additional Links */}
                            <div className="mt-6 text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Forgot your password?{" "}
                                    <a
                                        href="#"
                                        className="text-primary hover:underline"
                                    >
                                        Contact your administrator
                                    </a>
                                </p>
                                <a
                                    href="#"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Register Your Institute
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Demo Credentials */}
                    {/* <Card className="mt-6 card-flat">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Demo Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>
                                    <strong>Admin:</strong> admin@demo.com /
                                    admin123
                                </p>
                                <p>
                                    <strong>Faculty:</strong> faculty@demo.com /
                                    faculty123
                                </p>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>
            </div>
        </div>
    );
};

export default Login;
