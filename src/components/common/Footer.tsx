export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold bg-gradient-instagram bg-clip-text text-transparent">
              Social Media Nexo
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Mạng xã hội thông minh với AI
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 Social Media Nexo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};