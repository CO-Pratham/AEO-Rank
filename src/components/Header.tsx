import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>
              <img src="/AEO-Rank.jpeg" alt="AEO Rank Logo" className="w-8 h-8 rounded-sm object-cover" />
              <span className="text-xl font-bold text-foreground">AEORank</span>
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/agency" className="text-foreground hover:text-muted-foreground transition-colors" onClick={(e) => { e.preventDefault(); window.location.href = '/agency'; }}>
              Agency
            </a>
            <a href="/pricing" className="text-foreground hover:text-muted-foreground transition-colors" onClick={(e) => { e.preventDefault(); window.location.href = '/pricing'; }}>
              Pricing
            </a>
            <a href="/demo" className="text-foreground hover:text-muted-foreground transition-colors" onClick={(e) => { e.preventDefault(); window.location.href = '/demo'; }}>
              Demo
            </a>
            <a href="/blog" className="text-foreground hover:text-muted-foreground transition-colors" onClick={(e) => { e.preventDefault(); window.location.href = '/blog'; }}>
              Blog
            </a>
            <a href="/contact" className="text-foreground hover:text-muted-foreground transition-colors" onClick={(e) => { e.preventDefault(); window.location.href = '/contact'; }}>
              Contact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground hover:bg-muted" onClick={() => window.location.href = '/login'}>
              Log in
            </Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={() => window.location.href = '/signup'}>
              Sign up
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;