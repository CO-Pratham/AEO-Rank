import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TagsProvider } from "@/context/TagsContext";
import { CompetitorsProvider } from "@/context/CompetitorsContext";
import { SourcesProvider } from "@/context/SourcesContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Demo from "./pages/Demo";
import Pricing from "./pages/Pricing";
import Agency from "./pages/Agency";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import ChatGPTOptimization from "./pages/blog/ChatGPTOptimization";
import AEOGuide from "./pages/blog/AEOGuide";
import ClaudeVsChatGPT from "./pages/blog/ClaudeVsChatGPT";
import BestPractices from "./pages/BestPractices";
import Recommendations from "./pages/Recommendations";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import RankingPage from "./pages/dashboard/RankingPage";
import PromptsPage from "./pages/dashboard/PromptsPage";
import SourcesPage from "./pages/dashboard/SourcesPage";
import CompetitorsPage from "./pages/dashboard/CompetitorsPage";
import TagsPage from "./pages/dashboard/TagsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import PeoplePage from "./pages/dashboard/PeoplePage";
import WorkspacePage from "./pages/dashboard/WorkspacePage";
import CompanyPage from "./pages/dashboard/CompanyPage";
import SubscriptionPage from "./pages/dashboard/SubscriptionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WorkspaceProvider>
      <TagsProvider>
        <CompetitorsProvider>
          <SourcesProvider>
            <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/chatgpt-optimization-2024" element={<ChatGPTOptimization />} />
          <Route path="/blog/complete-aeo-guide" element={<AEOGuide />} />
          <Route path="/blog/claude-vs-chatgpt-comparison" element={<ClaudeVsChatGPT />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/best-practices" element={<BestPractices />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="prompts" element={<PromptsPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="best-practices" element={<BestPractices />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="competitors" element={<CompetitorsPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="company" element={<CompanyPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
            </TooltipProvider>
          </SourcesProvider>
        </CompetitorsProvider>
      </TagsProvider>
    </WorkspaceProvider>
  </QueryClientProvider>
);

export default App;
