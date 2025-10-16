import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testUserBrandAPI, checkUserStatus } from "@/utils/api";

const DebugAPI = () => {
  const [token, setToken] = useState("");
  const [results, setResults] = useState<string>("");

  const handleTest = async () => {
    setResults("Testing API endpoints...\n");
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    let logs = "";
    
    console.log = (...args) => {
      logs += args.join(" ") + "\n";
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs += "ERROR: " + args.join(" ") + "\n";
      originalError(...args);
    };

    try {
      await testUserBrandAPI(token || undefined);
      const userStatus = await checkUserStatus(token || undefined);
      logs += "\nFinal user status: " + JSON.stringify(userStatus, null, 2) + "\n";
    } catch (error) {
      logs += "Test failed: " + error + "\n";
    }

    // Restore console
    console.log = originalLog;
    console.error = originalError;
    
    setResults(logs);
  };

  const handleTestCurrentToken = async () => {
    const currentToken = localStorage.getItem("accessToken");
    if (currentToken) {
      setToken(currentToken);
      setResults("Using current token: " + currentToken.substring(0, 20) + "...\n");
    } else {
      setResults("No current token found in localStorage\n");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Access Token (optional - will use current token if empty)
            </label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter access token or leave empty to use current"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleTest}>
              Test API Endpoints
            </Button>
            <Button onClick={handleTestCurrentToken} variant="outline">
              Use Current Token
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Results:</label>
            <textarea
              className="w-full h-96 p-3 border rounded-md font-mono text-sm"
              value={results}
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAPI;
