import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Globe,
  Users,
  Tags,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  CreditCard,
  Crown,
  Swords,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import WorkspaceDropdown from "./WorkspaceDropdown";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Prompts", href: "/dashboard/prompts", icon: FileText },
  { name: "Sources", href: "/dashboard/sources", icon: Globe },
  { name: "Best Practices", href: "/dashboard/best-practices", icon: Lightbulb },
  { name: "Recommendations", href: "/dashboard/recommendations", icon: TrendingUp },
  { name: "Competitors", href: "/dashboard/competitors", icon: Swords },
  { name: "Tags", href: "/dashboard/tags", icon: Tags },
  { name: "People", href: "/dashboard/people", icon: Users },
  { name: "Workspace", href: "/dashboard/workspace", icon: Home },
  { name: "Company", href: "/dashboard/company", icon: Building2 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Subscription", href: "/dashboard/subscription", icon: Crown },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("aeorank_user") || "{}");
  
  // Ensure email is available from various storage sources
  if (!user.email) {
    const email = localStorage.getItem('userEmail') || 
                  localStorage.getItem('email') || 
                  localStorage.getItem('signupEmail') ||
                  localStorage.getItem('user_email');
    if (email) {
      user.email = email;
      // Update the stored user object with email
      localStorage.setItem('aeorank_user', JSON.stringify({...user, email}));
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("aeorank_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("email");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <div
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col h-full overflow-y-auto",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
                <span className="text-background font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-bold text-foreground">AEORank</span>
            </Link>
          )}
          {collapsed && (
            <Link
              to="/"
              className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center mx-auto"
            >
              <span className="text-background font-bold text-sm">A</span>
            </Link>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-start"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      {/* Workspace Dropdown */}
      <div className="px-2 pb-2">
        {!collapsed && <WorkspaceDropdown user={user} onLogout={handleLogout} />}
      </div>

      {/* Navigation */}
      <nav className="relative flex w-full min-w-0 flex-col p-2 space-y-1 py-0 gap-0.5 flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              General
            </h3>
          </div>
        )}
        {sidebarItems.slice(0, 1).map((item) => {
          const isActive = location.pathname === item.href || location.pathname === "/dashboard/ranking";
          return (
            <div key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">Overview</span>}
              </Link>
              {/* Ranking Sub-item */}
              {!collapsed && location.pathname === "/dashboard/ranking" && (
                <Link
                  to="/dashboard/ranking"
                  className="flex items-center px-3 py-2 ml-8 rounded-lg text-sm font-medium transition-colors bg-muted"
                >
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-2">Ranking</span>
                </Link>
              )}
            </div>
          );
        })}
        {sidebarItems.slice(1, 5).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="px-3 py-2 mt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Management
            </h3>
          </div>
        )}
        {sidebarItems.slice(5, 7).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="px-3 py-2 mt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Profile
            </h3>
          </div>
        )}
        {sidebarItems.slice(7, 12).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}

        {sidebarItems.slice(12).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-4",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
