import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface BestPractice {
  title: string;
  status: "Offsite" | "Onsite";
  impact: "Small" | "Medium" | "Large";
  description: string;
}

const practices: BestPractice[] = [
  {
    title: "Reply to top Reddit posts that are trending on ChatGPT",
    status: "Offsite",
    impact: "Small",
    description:
      "Reddit is among the top most influential sources for ChatGPT. Posts there get \"picked up\" almost instantly with heavy bias due to OpenAI's partnership with Reddit.",
  },
  {
    title: "Sponsor a Medium writer that has high impact in your industry",
    status: "Offsite",
    impact: "Medium",
    description:
      "Niche blogs or publishers like Medium creators or even newsletters are trusted often more than larger publications (less bias)",
  },
  {
    title: "Publish an educational post on your blog",
    status: "Onsite",
    impact: "Medium",
    description:
      "ChatGPT and AI engines resonate strongly with educational content that is related to a user query in which someone is trying to learn something. This is a great \"wedge\" to become more mentioned.",
  },
  {
    title: "Publish LinkedIn Pulse from the company account",
    status: "Offsite",
    impact: "Medium",
    description:
      "ChatGPT and AI engines pull recommendations from LinkedIn. But what few people know is that regular posts are rarely indexed. Instead, publish using LinkedIn's built-in blog tool.",
  },
  {
    title: "Get listed on Wikipedia",
    status: "Offsite",
    impact: "Large",
    description:
      "Wikipedia is often among the highest ranking domains for AEO impact. Companies or entities who are listed on Wikipedia are viewed as more trustworthy and their backlinks provide the most \"juice\" for any search engine that uses them",
  },
  {
    title: "Publish an article on Medium which is indexed by LLMs",
    status: "Offsite",
    impact: "Medium",
    description:
      "Niche blogs or publishers like Medium creators or even newsletters are trusted often more than larger publications (less bias)",
  },
];

const BestPractices = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Best Practices</h1>
          <p className="text-muted-foreground">
            Popular tactics which can improve your AI visibility. For personalized recommendations on your own data, check out our{" "}
            <a href="/recommendations" className="text-blue-600 hover:underline">
              Recommendations
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold mb-3">
                  {practice.title}
                </CardTitle>
                <div className="flex gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className={
                      practice.status === "Offsite"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {practice.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      practice.impact === "Small"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : practice.impact === "Medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {practice.impact}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">
                      Why is this important?
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {practice.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BestPractices;
