import { useState } from "react";
import { ChevronDown, Plus, LogOut, Mail, Settings, Copy, Lock, Crown, Building2, Globe, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingPopup } from "@/components/ui/pricing-popup";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useBrand } from "@/context/BrandContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceDropdownProps {
  user: { name?: string; email?: string; avatar?: string };
  onLogout: () => void;
}

const WorkspaceDropdown = ({ user, onLogout }: WorkspaceDropdownProps) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { brand, loading: brandLoading } = useBrand();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showProLock, setShowProLock] = useState(false);
  const [showPricingPopup, setShowPricingPopup] = useState(false);

  // Debug logging
  console.log('WorkspaceDropdown - brand:', brand);
  console.log('WorkspaceDropdown - currentWorkspace:', currentWorkspace);
  console.log('WorkspaceDropdown - workspaces:', workspaces);

  const handleNewWorkspace = () => {
    // Allow only one workspace on free plan; gate creating additional workspaces
    if (workspaces.length >= 1) {
      setShowProLock(true);
      return;
    }
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

  const handleCopyEmail = async () => {
    if (user.email) {
      try {
        await navigator.clipboard.writeText(user.email);
        toast({
          title: "Email Copied",
          description: "Email address copied to clipboard",
        });
      } catch (error) {
        console.error('Failed to copy email:', error);
        toast({
          title: "Copy Failed",
          description: "Failed to copy email address",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full outline-none">
        <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={
                  (() => {
                    const brandName = brand?.name || brand?.brand_name;
                    const brandDomain = brand?.domain || brand?.website;
                    if ((brand as any)?.logo) return (brand as any).logo;
                    
                    if (brandDomain) {
                      // Use the actual domain from brand data
                      return `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`;
                    } else if (brandName) {
                      // Brand domain mapping for correct logos
                      const brandDomainMapping: Record<string, string> = {
                        'bajaj': 'bajajfinserv.in',
                        'Bajaj': 'bajajfinserv.in',
                        'BAJAJ': 'bajajfinserv.in',
                        'bajaj finserv': 'bajajfinserv.in',
                        'Bajaj Finserv': 'bajajfinserv.in',
                      };
                      
                      const mappedDomain = brandDomainMapping[brandName.toLowerCase()] || brandDomainMapping[brandName];
                      if (mappedDomain) {
                        return `https://www.google.com/s2/favicons?domain=${mappedDomain}&sz=64`;
                      }
                      return `https://www.google.com/s2/favicons?domain=${brandName.toLowerCase().replace(/\s+/g, '')}.com&sz=64`;
                    }
                    
                    return user.avatar;
                  })()
                } 
                alt={brand?.brand_name || brand?.name || user.name} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentWorkspace?.name?.[0] || brand?.name?.[0] || brand?.brand_name?.[0] || user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                {(() => {
                  const brandName = currentWorkspace?.name || brand?.name || brand?.brand_name;
                  const brandNameMapping: Record<string, string> = {
                    'bajaj': 'Bajaj Finserv',
                    'Bajaj': 'Bajaj Finserv',
                    'BAJAJ': 'Bajaj Finserv',
                  };
                  return brandName ? (brandNameMapping[brandName] || brandName) : "No Brand";
                })()}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white z-50" align="end" side="right" sideOffset={8}>
        {/* Current Workspace/Brand Details */}
        <div className="px-4 py-3 border-b border-border bg-gradient-to-br from-blue-50/50 to-purple-50/30">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
              <AvatarImage 
                src={
                  (() => {
                    const brandName = brand?.name || brand?.brand_name;
                    const brandDomain = brand?.domain || brand?.website;
                    if ((brand as any)?.logo) return (brand as any).logo;
                    
                    if (brandDomain) {
                      // Use the actual domain from brand data
                      return `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`;
                    } else if (brandName) {
                      // Fallback to brand name
                      return `https://www.google.com/s2/favicons?domain=${brandName.toLowerCase().replace(/\s+/g, '')}.com&sz=64`;
                    }
                    return user.avatar;
                  })()
                } 
                alt={brand?.brand_name || brand?.name || user.name} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {brand?.name?.[0] || brand?.brand_name?.[0] || user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate mb-1">
                {brand?.name || brand?.brand_name || "Your Workspace"}
              </h3>
              <div className="space-y-1">
                {(brand?.website || brand?.domain) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      www.{(brand.website || brand.domain || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '')}
                    </span>
                  </div>
                )}
                {(brand?.location || brand?.country) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{brand.location || brand.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Email Section */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 group">
                <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {user.email || 'No email available'}
                </span>
                {user.email && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyEmail();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    title="Copy email"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuItem 
          onClick={() => navigate('/dashboard/settings')} 
          className="cursor-pointer px-3 py-2"
        >
          <div className="flex items-center gap-2 text-sm w-full">
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </div>
        </DropdownMenuItem>
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
        
        {/* Always show Pro-gated New Workspace entry */}
        <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Pro</div>
        <DropdownMenuItem onClick={() => setShowPricingPopup(true)} className="cursor-pointer opacity-80">
          <div className="flex items-center gap-2 w-full">
            <Lock className="w-4 h-4" />
            <span>New Workspace</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Pro Lock Dialog */}
      <Dialog open={showProLock} onOpenChange={setShowProLock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Multiple Workspaces is a Pro feature
            </DialogTitle>
            <DialogDescription>
              Upgrade to Pro to create and manage multiple workspaces for different teams or brands.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Free plan includes 1 workspace.</div>
            <div>Pro unlocks unlimited workspaces, advanced collaboration, and more.</div>
          </div>
          <DialogFooter className="gap-2 sm:space-x-2">
            <Button variant="outline" onClick={() => setShowProLock(false)}>Not now</Button>
            <Button onClick={() => { setShowProLock(false); navigate('/dashboard/subscription'); }}>Upgrade to Pro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Popup */}
      <PricingPopup
        isOpen={showPricingPopup}
        onClose={() => setShowPricingPopup(false)}
      />
    </DropdownMenu>
  );
};

export default WorkspaceDropdown;
