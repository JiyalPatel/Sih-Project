import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, User } from "lucide-react";

interface HeaderProps {
  showAuth?: boolean;
  showSearch?: boolean;
  title?: string;
}

const Header = ({ showAuth = true, showSearch = false, title }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-heading font-bold text-lg text-foreground">Smart Classroom</h1>
            <p className="text-xs text-muted-foreground">Timetable Scheduler</p>
          </div>
        </Link>

        {/* Page Title */}
        {title && (
          <div className="flex-1 text-center">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          </div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="form-input pl-10"
              />
            </div>
          </div>
        )}

        {/* Auth Buttons */}
        {showAuth && (
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;