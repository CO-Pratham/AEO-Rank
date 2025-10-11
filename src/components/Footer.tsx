const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Answer Engine Insights", href: "#" },
        { name: "Agent Analytics", href: "#" },
        { name: "Prompt Volumes", href: "#" },
        { name: "Competitive Intelligence", href: "#" }
      ]
    },
    {
      title: "Solutions",
      links: [
        { name: "Marketing Teams", href: "#" },
        { name: "Content Teams", href: "#" },
        { name: "PR & Brand Teams", href: "#" },
        { name: "Enterprise", href: "#" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#" },
        { name: "Guides", href: "#" },
        { name: "Case Studies", href: "#" },
        { name: "API Documentation", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Privacy Policy", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-foreground text-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-background rounded-sm flex items-center justify-center">
                <span className="text-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold">AEORank</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              AI search analytics platform helping brands optimize their presence across AI-powered search platforms.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <span className="sr-only">Twitter</span>
                <div className="w-5 h-5 bg-background/20 rounded"></div>
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <span className="sr-only">LinkedIn</span>
                <div className="w-5 h-5 bg-background/20 rounded"></div>
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <span className="sr-only">GitHub</span>
                <div className="w-5 h-5 bg-background/20 rounded"></div>
              </a>
            </div>
          </div>
          
          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-background mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-background/80 hover:text-background transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2025 AEORank. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;