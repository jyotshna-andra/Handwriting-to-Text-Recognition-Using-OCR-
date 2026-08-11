import { Camera, Upload, FileText, History, Sparkles, Globe, Mic, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Image to Text",
      description: "Capture handwritten notes with your camera and convert instantly"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "PDF Converter",
      description: "Extract text from scanned PDFs in seconds"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Summarize",
      description: "Automatically summarize long texts with AI"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language",
      description: "Support for English, Hindi, Tamil, Arabic, and more"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Output",
      description: "Listen to your converted text with voice playback"
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Smart History",
      description: "Access all your conversions anytime, anywhere"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">OCR Scanner</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/scan")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            Advanced OCR Technology
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Convert Handwriting to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Digital Text
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Easily scan and convert handwritten notes, documents, and PDFs into editable text. 
            Fast, accurate, and supports multiple languages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8 shadow-medium hover:shadow-lg transition-all"
              onClick={() => navigate("/scan")}
            >
              <Camera className="mr-2 w-5 h-5" />
              Start Scanning
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg h-14 px-8"
              onClick={() => navigate("/scan")}
            >
              <Upload className="mr-2 w-5 h-5" />
              Upload Image
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to convert handwriting to digital text
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-medium transition-all duration-300 border-2 hover:border-primary/20 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-secondary/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert your handwriting in three simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {[
            {
              step: "1",
              title: "Scan or Upload",
              description: "Take a photo of your handwritten notes or upload an existing image from your gallery"
            },
            {
              step: "2",
              title: "AI Processing",
              description: "Our advanced OCR engine analyzes and recognizes your handwriting, even cursive styles"
            },
            {
              step: "3",
              title: "Edit & Export",
              description: "Get editable digital text that you can copy, share, or export as PDF or TXT"
            }
          ].map((item, index) => (
            <Card key={index} className="p-8 flex items-start gap-6 hover:shadow-medium transition-all">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                <p className="text-lg text-muted-foreground">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-primary text-primary-foreground border-0 shadow-medium">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Convert Your Handwriting?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start scanning and converting your handwritten notes into digital text today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/scan")}
            >
              <Camera className="mr-2 w-5 h-5" />
              Start Now - It's Free
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">OCR Scanner</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 OCR Scanner. Convert handwriting to text effortlessly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
