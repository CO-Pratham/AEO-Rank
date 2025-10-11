import dashboardImage from "@/assets/dashboard-preview.jpg";

const DashboardPreview = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="dashboard-preview rounded-2xl overflow-hidden animate-float">
          <img
            src={dashboardImage}
            alt="AEORank Analytics Dashboard - Track brand performance with Visibility, Position, and Sentiment metrics across AI search platforms"
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
        
        {/* Dashboard Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-chart-1 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Visibility Tracking</h3>
            <p className="text-muted-foreground">
              Monitor how often your brand appears in AI search results across different platforms
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-chart-2 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Position Analysis</h3>
            <p className="text-muted-foreground">
              Track your ranking position and compare against competitors in AI responses
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-chart-3 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Sentiment Monitoring</h3>
            <p className="text-muted-foreground">
              Analyze how AI platforms perceive and present your brand to users
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;