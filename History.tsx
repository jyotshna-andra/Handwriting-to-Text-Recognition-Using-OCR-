import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Copy, Download, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getHistory, deleteHistoryItem, clearHistory, ConversionHistory } from "@/lib/ocr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ConversionHistory | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    loadHistory();
    toast.success("Item deleted from history");
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleClearAll = () => {
    clearHistory();
    loadHistory();
    setSelectedItem(null);
    toast.success("History cleared");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard!");
  };

  const handleDownload = (item: ConversionHistory) => {
    const blob = new Blob([item.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-${new Date(item.timestamp).toLocaleDateString()}.txt`;
    a.click();
    toast.success("File downloaded!");
  };

  const filteredHistory = history.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.languageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-bold">Conversion History</h1>
          </div>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {history.length} conversion{history.length !== 1 ? 's' : ''} from your history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {history.length > 0 ? (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search conversions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* History List */}
              <div className="lg:col-span-1 space-y-3">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <Card
                      key={item.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-medium ${
                        selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt="Thumbnail"
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate mb-1">
                            {item.text.substring(0, 50)}...
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.languageName}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No results found</p>
                  </Card>
                )}
              </div>

              {/* Detail View */}
              <div className="lg:col-span-2">
                {selectedItem ? (
                  <Card className="p-6">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold mb-2">Conversion Details</h2>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedItem.timestamp).toLocaleString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Language: {selectedItem.languageName}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this conversion?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this conversion from your history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(selectedItem.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Image */}
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img
                          src={selectedItem.image}
                          alt="Original"
                          className="w-full h-auto"
                        />
                      </div>

                      {/* Text */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Extracted Text</h3>
                        <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {selectedItem.text}
                          </pre>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCopy(selectedItem.text)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Copy className="mr-2 w-4 h-4" />
                          Copy Text
                        </Button>
                        <Button
                          onClick={() => handleDownload(selectedItem)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="mr-2 w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
                    <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Select a conversion</p>
                    <p className="text-muted-foreground">
                      Click on any item to view details
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : (
          <Card className="p-12 text-center max-w-md mx-auto">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No history yet</h2>
            <p className="text-muted-foreground mb-6">
              Your conversion history will appear here after you scan your first image
            </p>
            <Button onClick={() => navigate("/scan")}>
              Start Scanning
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
