import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import blogChatGPT from "@/assets/blog-chatgpt-optimization.jpg";
import blogAEO from "@/assets/blog-aeo-guide.jpg";
import blogClaudeVs from "@/assets/blog-claude-vs-chatgpt.jpg";
import blogMetrics from "@/assets/blog-ai-metrics.jpg";
import blogCaseStudy from "@/assets/blog-case-study.jpg";
import blogTrends from "@/assets/blog-future-trends.jpg";

const Blog = () => {
  useEffect(() => {
    document.title = "AEORank Blog - AI Search Optimization Tips & Insights";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Stay updated with the latest AI search optimization strategies, ChatGPT SEO tips, and brand visibility insights. Expert advice for AEO success.');
    }
  }, []);

  const blogPosts = [
    {
      id: 1,
      slug: "chatgpt-optimization-2024",
      title: "How to Optimize Your Brand for ChatGPT Searches in 2024",
      excerpt: "Discover the essential strategies to improve your brand visibility in ChatGPT responses and other AI-powered search platforms.",
      author: "Sarah Chen",
      date: "Dec 18, 2024",
      readTime: "8 min read",
      category: "AI Optimization",
      image: blogChatGPT,
      featured: true
    },
    {
      id: 2,
      slug: "complete-aeo-guide",
      title: "The Complete Guide to AI Search Engine Optimization (AEO)",
      excerpt: "Learn the fundamentals of AEO and how it differs from traditional SEO. Essential reading for modern marketers.",
      author: "Marcus Rodriguez",
      date: "Dec 15, 2024",
      readTime: "12 min read",
      category: "Strategy",
      image: blogAEO,
      featured: true
    },
    {
      id: 3,
      slug: "claude-vs-chatgpt-comparison",
      title: "Claude vs ChatGPT: Which AI Platform Should You Optimize For First?",
      excerpt: "A comprehensive comparison of major AI platforms and their impact on brand visibility.",
      author: "Emma Thompson",
      date: "Dec 12, 2024",
      readTime: "6 min read",
      category: "Platform Analysis",
      image: blogClaudeVs,
      featured: false
    },
    {
      id: 4,
      slug: "ai-search-performance-metrics",
      title: "Measuring AI Search Performance: Key Metrics That Matter",
      excerpt: "Understanding visibility scores, position rankings, and sentiment analysis in AI search results.",
      author: "David Park",
      date: "Dec 10, 2024",
      readTime: "10 min read",
      category: "Analytics",
      image: blogMetrics,
      featured: false
    },
    {
      id: 5,
      slug: "techcorp-case-study-300-percent-increase",
      title: "Case Study: How TechCorp Increased AI Visibility by 300%",
      excerpt: "Real-world success story showing how strategic AEO implementation transformed brand presence.",
      author: "Lisa Anderson",
      date: "Dec 8, 2024",
      readTime: "7 min read",
      category: "Case Study",
      image: blogCaseStudy,
      featured: false
    },
    {
      id: 6,
      slug: "future-ai-search-2025-predictions",
      title: "Future of AI Search: What to Expect in 2025",
      excerpt: "Industry predictions and trends that will shape the AI search landscape in the coming year.",
      author: "Alex Johnson",
      date: "Dec 5, 2024",
      readTime: "9 min read",
      category: "Trends",
      image: blogTrends,
      featured: false
    }
  ];

  const categories = ["All", "AI Optimization", "Strategy", "Platform Analysis", "Analytics", "Case Study", "Trends"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Header */}
      <header className="bg-background border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AEORank Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay ahead with the latest insights on AI search optimization, brand visibility strategies, and expert tips for dominating ChatGPT, Claude, Gemini, and more.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="hover:scale-105 transition-transform"
              onClick={() => console.log('Category filter clicked:', category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Posts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.filter(post => post.featured).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="w-4 h-4 mr-1" />
                      <span className="mr-4">{post.author}</span>
                      <CalendarDays className="w-4 h-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Latest Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <CalendarDays className="w-3 h-3 mr-1" />
                      <span>{post.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-gradient-to-r from-primary/10 to-chart-1/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Stay Updated with AI Search Trends
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join 5,000+ marketers who receive our weekly newsletter with the latest AI search optimization strategies and industry insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="sm:w-auto">Subscribe</Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Blog;