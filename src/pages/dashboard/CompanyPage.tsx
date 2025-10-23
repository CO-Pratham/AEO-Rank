import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, Loader2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiCall } from "@/utils/api";

const CompanyPage = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Fetch company data from /me endpoint
  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('https://aeotest-production.up.railway.app/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Company Page - /me response:', data);
          
          // Handle different response structures
          let brandData = null;
          
          if (data.brand) {
            brandData = data.brand;
          } else if (data.name || data.brand_name || data.website || data.domain) {
            // Data is at root level
            brandData = data;
          }
          
          if (brandData) {
            const companyName = brandData.name || brandData.brand_name || "";
            const companyDomain = brandData.website || brandData.domain || "";
            const companyLocation = brandData.location || brandData.country || "";
            
            setName(companyName);
            setDomain(companyDomain);
            setLocation(companyLocation);
            
            // Set hasData to true if we have at least name or domain
            if (companyName || companyDomain) {
              setHasData(true);
            }
            
            console.log('Company data loaded:', { companyName, companyDomain, companyLocation });
          } else {
            console.log('No brand data found in response');
          }
        } else {
          console.error('Failed to fetch /me:', response.status);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleConfirmEdit = async () => {
    setShowEditWarning(false);
    
    // Clear all dashboard data first
    setIsSaving(true);
    try {
      // Clear prompts
      await apiCall("/prompts", { method: "DELETE" }).catch(() => {});
      
      // Clear competitors
      await apiCall("/competitors", { method: "DELETE" }).catch(() => {});
      
      // Clear sources
      await apiCall("/sources", { method: "DELETE" }).catch(() => {});
      
      // Clear tags
      await apiCall("/tags", { method: "DELETE" }).catch(() => {});

      console.log("✅ All dashboard data cleared");
      
      toast({
        title: "Dashboard Cleared",
        description: "All dashboard data has been cleared. You can now edit the company.",
      });
    } catch (error) {
      console.error("Error clearing dashboard data:", error);
    } finally {
      setIsSaving(false);
    }

    // Enable edit mode so user can make changes
    setIsEditMode(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('https://aeotest-production.up.railway.app/user/brand', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          brand_name: name, 
          domain: domain,
          country: location
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      toast({
        title: "Company Updated",
        description: "Your company information has been updated successfully.",
      });
      
      // Exit edit mode
      setIsEditMode(false);
      setHasData(true);
      
      // Reload data
      window.location.reload();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update company information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Company</h1>
        </div>
        <Card className="border-border/40">
          <CardContent className="py-12 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading company data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Building2 className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Company</h1>
      </div>

      {/* Edit Company Card */}
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Company Details
              </CardTitle>
            </div>
            {/* Show add button when no data and not in edit mode */}
            {!hasData && !isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="h-9"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Add Company Info
              </Button>
            )}
            {/* Show edit button when has data and not in edit mode */}
            {hasData && !isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditWarning(true)}
                className="h-9"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {/* Show cancel button when in edit mode */}
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditMode(false);
                  // Reload to restore original data if there was any
                  if (hasData) {
                    window.location.reload();
                  }
                }}
                className="h-9"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-2xl"
              placeholder="Enter company name"
              disabled={!isEditMode}
            />
          </div>

          {/* Domain Field */}
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-medium">
              Domain
            </Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => {
                // Auto-clean the domain - remove http://, https://, and www.
                let cleanValue = e.target.value.trim();
                cleanValue = cleanValue.replace(/^https?:\/\//i, '');
                cleanValue = cleanValue.replace(/^www\./i, '');
                cleanValue = cleanValue.split('/')[0]; // Remove any path after domain
                setDomain(cleanValue);
              }}
              className="max-w-2xl"
              placeholder="example.com (no http:// or www.)"
              disabled={!isEditMode}
            />
            <p className="text-xs text-muted-foreground">
              Your company website domain
            </p>
          </div>

          {/* Save Button - Only show when in edit mode */}
          {isEditMode && (
            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <AlertDialog open={showEditWarning} onOpenChange={setShowEditWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">Warning: All Data Will Be Cleared</AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              <p className="font-medium text-foreground">
                Editing the company information will permanently delete all data from your dashboard, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                <li>All prompts and their rankings</li>
                <li>All competitor data and analysis</li>
                <li>All sources and references</li>
                <li>All tags and categories</li>
                <li>All other dashboard data</li>
              </ul>
              <p className="text-destructive font-medium pt-2">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditWarning(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEdit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Clear All Data & Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyPage;
