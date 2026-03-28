import { useState, useRef } from "react";
import { Upload, FileText, FileSpreadsheet, Download, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpend } from "@/context/SpendContext";
import { parseCSV, extractTextFromPDF, exportToCSV, downloadCSV } from "@/lib/csv-parser";
import { toast } from "@/hooks/use-toast";

export function FileUpload() {
  const { importTransactions, transactions, isLoaded } = useSpend();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    try {
      let parsed;

      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        parsed = parseCSV(text);
      } else if (file.name.endsWith(".pdf")) {
        const text = await extractTextFromPDF(file);
        parsed = parseCSV(text);
      } else {
        toast({ title: "Unsupported file", description: "Please upload a CSV or PDF file.", variant: "destructive" });
        setIsProcessing(false);
        setFileName(null);
        return;
      }

      if (parsed.length === 0) {
        toast({ title: "No data found", description: "Could not extract valid transactions from the file. Ensure columns include: date, vendor, category, department, amount.", variant: "destructive" });
        setFileName(null);
      } else {
        importTransactions(parsed);
        toast({ title: "Import successful", description: `${parsed.length} transactions imported and audited.` });
      }
    } catch {
      toast({ title: "Import failed", description: "Error reading file. Please check the format.", variant: "destructive" });
      setFileName(null);
    }

    setIsProcessing(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleExport = () => {
    const csv = exportToCSV(transactions);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `spendguard-audit-${date}.csv`);
    toast({ title: "Export complete", description: "Audit report downloaded as CSV." });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Import Transactions</CardTitle>
          {isLoaded && (
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.pdf"
            onChange={onFileSelect}
            className="hidden"
          />

          {isProcessing ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Processing {fileName}...</p>
            </>
          ) : fileName && isLoaded ? (
            <>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {fileName.endsWith(".csv") ? (
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                ) : (
                  <FileText className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">Imported successfully · Drop another file to replace</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drop CSV or PDF here</p>
                <p className="text-xs text-muted-foreground">or click to browse · Columns: date, vendor, category, department, amount</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
