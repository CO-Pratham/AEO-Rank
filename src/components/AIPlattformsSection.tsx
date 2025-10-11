import chatgptIcon from "@/assets/logos/chatgpt-icon.svg";
import perplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";
import claudeIcon from "@/assets/logos/claude-ai-icon.svg";
import geminiIcon from "@/assets/logos/google-gemini-icon.svg";
import googleIcon from "@/assets/logos/google-ai-studio-icon.svg";
import grokIcon from "@/assets/logos/grok-icon.svg";
import copilotIcon from "@/assets/logos/copilot-icon.svg";
import metaIcon from "@/assets/logos/meta-icon.svg";

const AIPlattformsSection = () => {
  const platforms = [
    { name: "Perplexity", logo: perplexityIcon },
    { name: "ChatGPT", logo: chatgptIcon },
    { name: "Claude", logo: claudeIcon },
    { name: "Gemini", logo: geminiIcon },
    { name: "Google AI", logo: googleIcon },
    { name: "Grok", logo: grokIcon },
    { name: "Copilot", logo: copilotIcon },
    { name: "Meta AI", logo: metaIcon },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Track your brand across leading AI platforms
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          Monitor how your brand appears in responses from the AI platforms that
          millions of users rely on daily
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {platforms.map((platform, index) => (
            <div
              key={platform.name}
              className="flex flex-col items-center space-y-3 p-6 bg-background rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-2">
                <img
                  src={platform.logo}
                  alt={`${platform.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-medium text-foreground">
                {platform.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-background rounded-2xl p-8 shadow-soft">
          <p className="text-lg text-muted-foreground">
            Reach millions of consumers who are using AI to discover new
            products and brands
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIPlattformsSection;
