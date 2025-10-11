import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CompanyPage = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  useEffect(() => {
    // ====== BACKEND ENDPOINT ======
    // TODO: Fetch company data from API
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/company');
        
        if (response.ok) {
          const data = await response.json();
          setName(data.name || "");
          setDomain(data.domain || "");
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
      }
    };

    fetchCompanyData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // ====== BACKEND ENDPOINT ======
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, domain }),
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      toast({
        title: "Company Updated",
        description: "Your company information has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update company information.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Building2 className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Company</h1>
      </div>

      {/* Edit Company Card */}
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Edit Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-2xl"
              placeholder="Enter company name"
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
              onChange={(e) => setDomain(e.target.value)}
              className="max-w-2xl"
              placeholder="company.com"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPage;
