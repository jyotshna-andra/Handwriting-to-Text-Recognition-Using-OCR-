import { useState, useRef, useEffect } from "react";
import { Camera, Upload, FileText, ArrowLeft, Copy, Download, Sparkles, History, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { performOCR, supportedLanguages, saveToHistory, OCRProgress } from "@/lib/ocr";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Scan = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("eng");
  const [targetLanguage, setTargetLanguage] = useState<string>("none");
  const [ocrProgress, setOcrProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        processOCR(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async (file: File) => {
    setIsProcessing(true);
    setExtractedText("");
    setOcrProgress({ status: 'initializing', progress: 0 });

    try {
      const text = await performOCR(
        file,
        selectedLanguage,
        (progress) => setOcrProgress(progress)
      );

      if (text.trim()) {
        setExtractedText(text);
        
        // Save to history
        const languageName = supportedLanguages.find(l => l.code === selectedLanguage)?.name || 'English';
        if (selectedImage) {
          saveToHistory({
            image: selectedImage,
            text,
            language: selectedLanguage,
            languageName,
          });
        }
        
        toast.success("Text extracted successfully!");
      } else {
        toast.error("No text detected in image");
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error("Failed to extract text. Please try another image.");
    } finally {
      setIsProcessing(false);
      setOcrProgress({ status: '', progress: 0 });
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    if (selectedFile) {
      processOCR(selectedFile);
    }
  };

  const handleTranslate = async (targetLang: string) => {
    if (!extractedText.trim() || targetLang === "none") {
      return;
    }

    setIsTranslating(true);
    
    try {
      const languageName = supportedLanguages.find(l => l.code === targetLang)?.name || targetLang;
      
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { 
          text: extractedText,
          targetLanguage: languageName
        }
      });

      if (error) throw error;

      if (data?.translatedText) {
        setTranslatedText(data.translatedText);
        toast.success(`Translated to ${languageName}!`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate text. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Auto-translate when target language changes
  useEffect(() => {
    if (targetLanguage !== "none" && extractedText && !isTranslating) {
      handleTranslate(targetLanguage);
    } else if (targetLanguage === "none") {
      setTranslatedText("");
    }
  }, [targetLanguage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard!");
  };

  const handleSummarize = async () => {
    if (!extractedText.trim()) {
      toast.error("No text to summarize");
      return;
    }

    setIsSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-text', {
        body: { text: extractedText }
      });

      if (error) throw error;

      if (data?.summary) {
        setSummary(data.summary);
        toast.success("Text summarized successfully!");
      }
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error("Failed to summarize text. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = (format: 'txt' | 'doc' = 'txt') => {
    if (format === 'txt') {
      const blob = new Blob([extractedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ocr-text-${Date.now()}.txt`;
      a.click();
      toast.success("TXT file downloaded!");
    } else {
      // Create a simple Word-compatible HTML document
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>OCR Converted Text</title>
          </head>
          <body>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${extractedText}</pre>
          </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ocr-text-${Date.now()}.doc`;
      a.click();
      toast.success("Word document downloaded!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">OCR Scanner</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/history")}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Scan & Convert</h1>
          <p className="text-lg text-muted-foreground">
            Upload or capture an image to extract text
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="p-8">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Upload className="w-6 h-6 text-primary" />
                  Upload Image
                </h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Source Language (OCR)
                  </label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {extractedText && (
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Translate To (Optional)
                    </label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language to translate..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="none">No Translation</SelectItem>
                        {supportedLanguages
                          .filter(lang => lang.code !== selectedLanguage)
                          .map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedImage ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-lg font-medium mb-2">Click to upload an image</p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, HEIC, and more
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="mr-2 w-5 h-5" />
                  Take a Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-auto"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-4 p-6">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <div>
                          <p className="text-lg font-medium mb-2">
                            {ocrProgress.status === 'loading language traineddata' && 'Loading language data...'}
                            {ocrProgress.status === 'initializing tesseract' && 'Initializing OCR...'}
                            {ocrProgress.status === 'initialized tesseract' && 'OCR Ready...'}
                            {ocrProgress.status === 'recognizing text' && 'Extracting text...'}
                            {!ocrProgress.status && 'Processing...'}
                          </p>
                          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-primary transition-all duration-300"
                              style={{ width: `${ocrProgress.progress * 100}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {Math.round(ocrProgress.progress * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setExtractedText("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Upload Different Image
                </Button>
              </div>
            )}
          </Card>

          {/* Results Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent" />
              Extracted Text
            </h2>

            {!extractedText ? (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center h-[400px] flex flex-col items-center justify-center">
                <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No text extracted yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload an image to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Original Text</label>
                    {isTranslating && (
                      <span className="text-xs text-muted-foreground">Translating...</span>
                    )}
                  </div>
                  <Textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm resize-none"
                    placeholder="Extracted text will appear here..."
                  />
                </div>

                {translatedText && (
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Translated Text ({supportedLanguages.find(l => l.code === targetLanguage)?.name})
                    </label>
                    <Textarea
                      value={translatedText}
                      onChange={(e) => setTranslatedText(e.target.value)}
                      className="min-h-[200px] font-mono text-sm resize-none bg-accent/5"
                      placeholder="Translation will appear here..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 w-4 h-4" />
                    {isSummarizing ? 'Summarizing...' : 'AI Summarize'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                    >
                      <Copy className="mr-2 w-4 h-4" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => handleDownload('txt')}
                      variant="outline"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      TXT
                    </Button>
                    <Button
                      onClick={() => handleDownload('doc')}
                      variant="outline"
                      className="col-span-2"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Download as Word Document
                    </Button>
                  </div>
                </div>

                {summary && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold text-sm">AI Summary</h3>
                    </div>
                    <p className="text-sm leading-relaxed">{summary}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* History Preview */}
        {extractedText && (
          <Card className="mt-6 p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Conversion saved to history</h3>
                <p className="text-sm text-muted-foreground">
                  You can access this conversion anytime from your history. Future updates will add persistent storage.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scan;
