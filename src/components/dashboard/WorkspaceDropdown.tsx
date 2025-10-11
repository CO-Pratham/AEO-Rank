import { useState } from "react";
import { ChevronDown, Plus, LogOut, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceDropdownProps {
  user: { name?: string; email?: string; avatar?: string };
  onLogout: () => void;
}

const WorkspaceDropdown = ({ user, onLogout }: WorkspaceDropdownProps) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNewWorkspace = () => {
    navigate("/dashboard/workspace?new=true");
    toast({
      title: "Create New Workspace",
      description: "Fill in the form to create a new workspace.",
    });
  };

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    toast({
      title: "Workspace Switched",
      description: `Switched to ${workspaces.find(w => w.id === workspaceId)?.name}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full outline-none">
        <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentWorkspace?.name?.[0] || user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                {currentWorkspace?.name || "No Workspace"}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white z-50" align="end" side="right" sideOffset={8}>
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {workspaces.length > 0 && (
          <>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSwitch(workspace.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  {currentWorkspace?.id === workspace.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <span className={currentWorkspace?.id === workspace.id ? "font-semibold" : ""}>
                    {workspace.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleNewWorkspace} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkspaceDropdown;
