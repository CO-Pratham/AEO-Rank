import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendInviteEmail } from "@/services/emailService";

interface User {
  id: string;
  email: string;
  inviteTo: "Company Member" | "Workspace Member";
  inviteAs: "Admin" | "Editor" | "Viewer";
  createdAt: Date;
}

const PeoplePage = () => {
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem("aeorank_user") || "{}");

  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTo, setInviteTo] = useState<
    "Company Member" | "Workspace Member"
  >("Company Member");
  const [inviteAs, setInviteAs] = useState<
    "Admin" | "Editor" | "Viewer"
  >("Admin");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const getTimeAgo = (date: Date) => {
    const days = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check if user already invited
    if (users.some((u) => u.email === inviteEmail)) {
      toast({
        title: "Already Invited",
        description: `${inviteEmail} has already been invited`,
        variant: "destructive",
      });
      return;
    }

    setIsSendingInvite(true);

    try {
      // Send the invitation email
      const emailSent = await sendInviteEmail({
        recipientEmail: inviteEmail,
        recipientRole: `${inviteTo} - ${inviteAs}`,
        inviterName: currentUser.name || currentUser.email || "AEORank Team",
        inviterEmail: currentUser.email || "team@aeorank.com",
      });

      if (emailSent) {
        const newUser: User = {
          id: Date.now().toString(),
          email: inviteEmail,
          inviteTo: inviteTo,
          inviteAs: inviteAs,
          createdAt: new Date(),
        };

        setUsers([...users, newUser]);
        setInviteEmail("");
        setInviteTo("Company Member");
        setInviteAs("Admin");

        toast({
          title: "Invitation Sent! 📧",
          description: `An invitation email has been sent to ${inviteEmail}`,
          duration: 5000,
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Failed to Send Invitation",
        description:
          "There was an error sending the invitation email. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setUsers(users.filter((u) => u.id !== userId));

    toast({
      title: "User Removed",
      description: `${user?.email} has been removed`,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center space-x-2 mb-8">
        <Users className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-normal text-foreground">People</h1>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-sm font-medium mb-4 text-foreground">
            Invite People
          </h2>
          <div className="grid grid-cols-[1fr_200px_180px_auto] gap-3 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="friend@provider.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-9 bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Invite to
              </label>
              <Select
                value={inviteTo}
                onValueChange={(value: any) => setInviteTo(value)}
              >
                <SelectTrigger className="h-9 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Company Member"
                    className="focus:bg-blue-600 focus:text-white"
                  >
                    <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded text-xs font-medium">
                      Company Member
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="Workspace Member"
                    className="focus:bg-green-600 focus:text-white"
                  >
                    <span className="bg-green-600 text-white px-2.5 py-0.5 rounded text-xs font-medium">
                      Workspace Member
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Invite as
              </label>
              <Select
                value={inviteAs}
                onValueChange={(value: any) => setInviteAs(value)}
              >
                <SelectTrigger className="h-9 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Admin"
                    className="focus:bg-purple-600 focus:text-white"
                  >
                    <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded text-xs font-medium">
                      Admin
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="Editor"
                    className="focus:bg-orange-600 focus:text-white"
                  >
                    <span className="bg-orange-600 text-white px-2.5 py-0.5 rounded text-xs font-medium">
                      Editor
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="Viewer"
                    className="focus:bg-gray-600 focus:text-white"
                  >
                    <span className="bg-gray-600 text-white px-2.5 py-0.5 rounded text-xs font-medium">
                      Viewer
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInviteUser}
              disabled={isSendingInvite}
              className="h-9 px-6 bg-foreground text-background hover:bg-foreground/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Invite"
              )}
            </Button>
          </div>
        </div>

        <div className="pt-4">
          <div className="grid grid-cols-[200px_180px_1fr_140px_40px] gap-4 px-2 py-2 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground">
              Type
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Role
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Email
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Created
            </div>
            <div className="text-xs font-medium text-muted-foreground"></div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[200px_180px_1fr_140px_40px] gap-4 items-center px-2 py-3 border-b border-border hover:bg-muted/20 transition-colors"
            >
              <div>
                <Badge
                  className={`${
                    user.inviteTo === "Company Member"
                      ? "bg-blue-600 hover:bg-blue-600"
                      : "bg-green-600 hover:bg-green-600"
                  } text-white text-xs px-2.5 py-0.5 font-medium`}
                >
                  {user.inviteTo}
                </Badge>
              </div>
              <div>
                <Badge
                  className={`${
                    user.inviteAs === "Admin"
                      ? "bg-purple-600 hover:bg-purple-600"
                      : user.inviteAs === "Editor"
                      ? "bg-orange-600 hover:bg-orange-600"
                      : "bg-gray-600 hover:bg-gray-600"
                  } text-white text-xs px-2.5 py-0.5 font-medium`}
                >
                  {user.inviteAs}
                </Badge>
              </div>
              <div className="text-sm text-foreground">{user.email}</div>
              <div className="text-sm text-muted-foreground">
                {getTimeAgo(user.createdAt)}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeoplePage;
