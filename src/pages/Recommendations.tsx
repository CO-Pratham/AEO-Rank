import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Recommendation {
  id: string;
  dateCompiled: string;
  status: "Pending" | "In Progress" | "Completed";
  actionItem: string;
  effort: string;
  effortProgress: number;
  scope: "Offsite" | "Onsite";
  queryGroup: string;
  task: string;
  whyImportant: string;
  queries: string[];
  actionDetails: string;
  locked?: boolean;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    dateCompiled: "October 5, 2025",
    status: "Pending",
    actionItem: "Reply to top Reddit posts that are trending on ChatGPT",
    effort: "Track visibility impact",
    effortProgress: 1,
    scope: "Offsite",
    queryGroup: "AppStorys-e8e9ddf1-df3f-4278-a797-bb42ced05a49",
    task: "Ask your social media team to comment on them ASAP to make sure we're being noticed",
    whyImportant:
      'Reddit is among the top most influential sources for ChatGPT. Posts there get "picked up" almost instantly with heavy bias due to OpenAI\'s partnership with Reddit.',
    queries: [
      "reddit.com/r/ProductManag [...] ing_customer",
      "reddit.com/r/startup/comm [...] ur_softwares",
      "reddit.com/r/SaaS/comment [...] st_practices",
    ],
    actionDetails: "36% of queries in your niche are influenced by Reddit.",
  },
  {
    id: "2",
    dateCompiled: "October 3, 2025",
    status: "Pending",
    actionItem: "Publish educational content on your blog",
    effort: "High quality content",
    effortProgress: 2,
    scope: "Onsite",
    queryGroup: "AppStorys-a1b2c3d4-e5f6-7890-g123-h456i789j012",
    task: "Create in-depth guides and tutorials related to your product",
    whyImportant:
      "Educational content ranks highly in AI responses and helps establish authority in your niche.",
    queries: ["How to improve product management", "Best SaaS practices"],
    actionDetails: "42% of queries benefit from educational blog content.",
    locked: true,
  },
  {
    id: "3",
    dateCompiled: "October 1, 2025",
    status: "In Progress",
    actionItem: "Engage with industry influencers on LinkedIn",
    effort: "Track visibility impact",
    effortProgress: 3,
    scope: "Offsite",
    queryGroup: "AppStorys-x9y8z7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
    task: "Comment and share insights on posts by key industry leaders",
    whyImportant:
      "LinkedIn engagement increases your visibility in professional AI responses and builds credibility.",
    queries: ["Best startup advisors", "Product management experts"],
    actionDetails: "28% of professional queries reference LinkedIn activity.",
    locked: true,
  },
];

const Recommendations = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>(mockRecommendations);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleMarkAsCompleted = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, status: "Completed" as const } : rec
      )
    );
  };

  const handleMarkAsRejected = (id: string) => {
    setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
  };

  const handleExportData = () => {
    const csvHeaders = [
      "Date Compiled",
      "Status",
      "Action Item",
      "Effort",
      "Scope",
      "Query Group",
      "Task",
    ];

    const csvRows = recommendations.map((rec) => [
      rec.dateCompiled,
      rec.status,
      `"${rec.actionItem}"`,
      rec.effort,
      rec.scope,
      rec.queryGroup,
      `"${rec.task}"`,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `recommendations_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-green-500";
      case "In Progress":
        return "bg-yellow-500";
      case "Completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderEffortDots = (progress: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full ${
              dot <= progress ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              AI Visibility Recommendations
            </h1>
            <p className="text-muted-foreground">
              Personalized recommendations to improve your presence in AI
              responses
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
            <table className="w-full table-fixed">
              <thead className="border-b bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider w-[140px]">
                    Date Compiled
                  </th>
                  <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider w-[120px]">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Action Item
                  </th>
                  <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider w-[180px]">
                    Effort
                  </th>
                  <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider w-[100px]">
                    Scope
                  </th>
                  <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider w-[100px]">
                    Details
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockRecommendations.map((rec) => (
                  <>
                    <tr
                      key={rec.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm">{rec.dateCompiled}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              rec.status
                            )}`}
                          />
                          <span className="text-sm">{rec.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium max-w-md">
                        {rec.actionItem}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{rec.effort}</span>
                          {renderEffortDots(rec.effortProgress)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={
                            rec.scope === "Offsite"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {rec.scope}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {rec.locked ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 text-xs"
                          >
                            Unlock 🔒
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(rec.id)}
                            className="p-0 h-auto"
                          >
                            {expandedRow === rec.id ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto"
                            >
                              <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Completed</DropdownMenuItem>
                            <DropdownMenuItem>Do it For Me</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Rejected
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    {expandedRow === rec.id && (
                      <tr className="bg-muted/20">
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <h3 className="font-semibold text-lg mb-4">
                                Action Item Details
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                {rec.actionDetails}{" "}
                                <button className="text-blue-600 hover:underline">
                                  [show queries]
                                </button>
                              </p>
                              <p className="text-sm mb-4">
                                These Reddit posts are the most influential in
                                your niche. Ask your social media team to
                                comment on them ASAP to make sure we're being
                                noticed.
                              </p>
                              <ol className="list-decimal list-inside space-y-2">
                                {rec.queries.map((query, idx) => (
                                  <li key={idx} className="text-sm">
                                    <a
                                      href="#"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {query}
                                    </a>{" "}
                                    <button className="text-blue-600 hover:underline text-xs">
                                      [show queries]
                                    </button>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg mb-4">
                                Additional Information
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    Query Group
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {rec.queryGroup}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    Task
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {rec.task}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    Why Important
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {rec.whyImportant}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t">
                            <p className="text-sm font-medium mb-3">Feedback</p>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                Was this recommendation useful?
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                👍 Yes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                👎 No
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
