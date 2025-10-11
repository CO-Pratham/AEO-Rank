import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  TrendingUp, 
  Zap, 
  Shield, 
  Eye, 
  Award,
  BarChart3,
  Users,
  Clock,
  Star
} from "lucide-react";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Agency = () => {
  useEffect(() => {
    document.title = "AEORank Agency - Dominate AI Search Results | Professional AI Optimization Services";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional AI search optimization services. Get your brand featured at the top of ChatGPT, Claude, Gemini, and all major AI platforms. Dominate AI search before your competitors.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Dominate AI Search<br />Before Your Competitors
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
              Get your brand featured at the top of ChatGPT, Gemini, and every major AI search result. The future of search is here—and your customers are asking AI about you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Dominating AI Search
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                See How It Works
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">87%</div>
                <p className="text-muted-foreground">of consumers now use AI search</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">3x</div>
                <p className="text-muted-foreground">higher conversion rates</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24h</div>
                <p className="text-muted-foreground">to see first results</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Your Brand Is Invisible in AI Search
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                While you're optimizing for Google, your customers are asking ChatGPT and Gemini about your industry. And your competitors are getting mentioned instead of you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 border-destructive/20">
                <CardHeader>
                  <TrendingUp className="w-12 h-12 text-destructive mb-4" />
                  <CardTitle className="text-xl">AI Search Is Taking Over</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">87% of consumers now use AI for research. Traditional SEO isn't enough anymore.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardHeader>
                  <Users className="w-12 h-12 text-destructive mb-4" />
                  <CardTitle className="text-xl">You're Losing Market Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Every day you're not optimized for AI search, competitors capture your potential customers.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardHeader>
                  <Shield className="w-12 h-12 text-destructive mb-4" />
                  <CardTitle className="text-xl">Zero Control Over Your Narrative</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">AI decides what to say about your brand. Without optimization, it might not be what you want.</p>
                </CardContent>
              </Card>
            </div>

            {/* Wake Up Call */}
            <div className="mt-16 p-8 bg-muted/50 rounded-2xl">
              <h3 className="text-2xl font-bold text-foreground mb-4">The Wake-Up Call: Test It Yourself</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Go to ChatGPT right now and ask: "What are the best companies for [your industry]?"
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Is your brand mentioned? Are your competitors getting the spotlight?
              </p>
              
              <div className="bg-background p-6 rounded-lg border">
                <div className="mb-2">
                  <Badge variant="outline">User:</Badge>
                  <p className="mt-2 text-sm">"What are the best digital marketing agencies for SaaS companies?"</p>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary">ChatGPT:</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Here are some top agencies: HubSpot, Salesforce Marketing Cloud, Marketo...
                  </p>
                  <p className="mt-2 text-sm text-destructive font-medium">[Your company is nowhere to be found]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our AI Search Optimization Services
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                We don't just optimize for search engines. We optimize for the AI systems that are reshaping how your customers discover and choose brands.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Zap className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>AI Response Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">We engineer your brand to be the top recommendation when AI systems answer questions about your industry.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Eye className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Prompt Engineering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Strategic content placement that triggers AI models to mention your brand in relevant search contexts.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Multi-Platform Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Optimize for ChatGPT, Gemini, Claude, Perplexity, and every major AI search platform simultaneously.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>AI Mention Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Real-time monitoring and reporting on when, where, and how AI mentions your brand across platforms.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Reputation Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Ensure AI systems present accurate, positive information about your brand and address any negative mentions.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Competitive Dominance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Strategic positioning to outrank competitors in AI-generated recommendations and comparisons.</p>
                </CardContent>
              </Card>
            </div>

            {/* Package Stats */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-8">Complete AI Search Domination Package</h3>
              <p className="text-lg text-muted-foreground mb-12">Everything you need to dominate AI search results and stay ahead of the competition.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">30+</div>
                  <p className="text-muted-foreground">AI Platforms Covered</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-muted-foreground">Monitoring & Alerts</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">90%</div>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">14 Days</div>
                  <p className="text-muted-foreground">Average Results</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why AI Search Optimization Changes Everything
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                This isn't just another marketing channel. It's the future of how customers discover, research, and choose brands. Get ahead now, or get left behind.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-8">The AI Search Revolution Is Here</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Exponential Growth</h4>
                      <p className="text-muted-foreground">AI search usage is growing 300% year-over-year. Your customers are already there.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Consumer Behavior Shift</h4>
                      <p className="text-muted-foreground">87% of consumers now use AI for research before making purchasing decisions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Higher Conversion Value</h4>
                      <p className="text-muted-foreground">AI-recommended brands see 3x higher conversion rates and 2x higher customer lifetime value.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">First-Mover Advantage</h4>
                      <p className="text-muted-foreground">The window to establish dominance is closing. Early adopters are capturing market share.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-8">Real Results From Our Clients</h3>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-semibold text-foreground">340% increase in qualified leads</span>
                    </div>
                    <p className="text-muted-foreground">SaaS company, 3 months after AI optimization</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-semibold text-foreground">Now mentioned in 8/10 AI searches</span>
                    </div>
                    <p className="text-muted-foreground">E-commerce brand, previously unmentioned</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-semibold text-foreground">Outranking competitors consistently</span>
                    </div>
                    <p className="text-muted-foreground">Professional services firm, industry leader position</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Competition Stats */}
            <div className="mt-16 p-8 bg-gradient-to-r from-destructive/10 to-primary/10 rounded-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">The Competition Is Already Moving</h3>
                <p className="text-lg text-muted-foreground">
                  While you're reading this, your smartest competitors are already optimizing for AI search. Every day you wait is market share they're capturing.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-destructive mb-2">-23%</div>
                  <p className="text-muted-foreground">Average brand visibility loss for non-optimized companies</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">+187%</div>
                  <p className="text-muted-foreground">Revenue growth for AI-optimized brands</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">6 Months</div>
                  <p className="text-muted-foreground">Time to establish unshakeable market position</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Dominate AI Search Results?
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12">
              Don't let your competitors capture your market share. Start your AI search optimization today and see results within 24 hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Free AI Search Audit</CardTitle>
                  <CardDescription>Complete analysis of your current AI visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-primary mr-2" />Complete analysis of your current AI visibility</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-primary mr-2" />Competitor AI search positioning report</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-primary mr-2" />Custom optimization strategy roadmap</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-primary mr-2" />30-day quick wins action plan</li>
                  </ul>
                  <Button className="w-full">Get Your Free Audit</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fast Track Results</CardTitle>
                  <CardDescription>Skip the audit and jump straight into full optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Perfect for businesses ready to dominate immediately.</p>
                  <Button className="w-full" variant="outline">Start Full Optimization</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enterprise Solution</CardTitle>
                  <CardDescription>Multi-brand optimization and dedicated management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Multi-brand optimization, dedicated account management, and white-label reporting for agencies and large companies.</p>
                  <Button className="w-full" variant="secondary">Enterprise Consultation</Button>
                </CardContent>
              </Card>
            </div>

            {/* Final Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Brands Optimized</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24h</div>
                <p className="text-muted-foreground">First Results</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">Client Satisfaction</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3x</div>
                <p className="text-muted-foreground">ROI Average</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Agency;