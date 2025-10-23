import { useState, useEffect } from "react";
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
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import WorkspaceDropdown from "./WorkspaceDropdown";
import { fetchUserProfile } from "@/utils/api";
import { useBrand } from "@/context/BrandContext";

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
  const { brand } = useBrand();
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("aeorank_user");
      return savedUser ? JSON.parse(savedUser) : { email: '', name: 'User', avatar: '' };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return { email: '', name: 'User', avatar: '' };
    }
  });

  // Fetch user data from API on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfile();
        console.log('User data from API:', userData);
        
        // Update user state with API data
        const updatedUser = {
          email: userData.email || localStorage.getItem('userEmail') || localStorage.getItem('email') || '',
          name: userData.name || userData.brand_name || 'User',
          avatar: userData.avatar || ''
        };
        
        setUser(updatedUser);
        localStorage.setItem('aeorank_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to existing logic if API fails
        const email = localStorage.getItem('userEmail') || 
                      localStorage.getItem('email') || 
                      localStorage.getItem('signupEmail') ||
                      localStorage.getItem('user_email') || '';
        const fallbackUser = {
          email: email,
          name: 'User',
          avatar: ''
        };
        setUser(fallbackUser);
        localStorage.setItem('aeorank_user', JSON.stringify(fallbackUser));
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <img src="/AEO-Rank.jpeg" alt="AEORank" className="w-8 h-8 rounded-sm object-cover" />
              <span className="text-lg font-bold text-foreground">AEORank</span>
            </Link>
          )}
          {collapsed && (
            <Link
              to="/"
              className="flex items-center justify-center mx-auto"
            >
              <img src="/AEO-Rank.jpeg" alt="AEORank" className="w-8 h-8 rounded-sm object-cover" />
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
          const isPromptDetailActive = item.href === "/dashboard/prompts" && location.pathname.startsWith("/dashboard/prompts/");

          return (
            <div key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive || isPromptDetailActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>

              {/* Prompt Detail Sub-item */}
              {!collapsed && item.href === "/dashboard/prompts" && location.pathname.startsWith("/dashboard/prompts/") && (
                <Link
                  to={location.pathname}
                  className="flex items-center px-3 py-2 ml-8 rounded-lg text-sm font-medium transition-colors bg-muted"
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-2">Prompt Detail</span>
                </Link>
              )}
            </div>
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
