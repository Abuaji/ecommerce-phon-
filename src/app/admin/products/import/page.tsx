"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertCircle, FileSpreadsheet, FileArchive, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PreviewTable } from "@/components/admin/import/preview-table";

export default function ImportPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "previewing" | "confirming" | "executing" | "success" | "error">("idle");
  const [previewData, setPreviewData] = useState<any>(null);
  const [executionData, setExecutionData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownloadTemplate = () => {
    window.location.href = "/api/admin/imports/template";
  };

  const handlePreview = async () => {
    if (!excelFile) return;
    setStatus("previewing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("excel", excelFile);
      if (zipFile) formData.append("zip", zipFile);

      const res = await fetch("/api/admin/imports/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate preview");

      setPreviewData(data);
      setStatus("confirming");
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  const handleExecute = async () => {
    if (!excelFile) return;
    setStatus("executing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("excel", excelFile);
      if (zipFile) formData.append("zip", zipFile);

      const res = await fetch("/api/admin/imports/execute", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute import");

      setExecutionData(data);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  const reset = () => {
    setExcelFile(null);
    setZipFile(null);
    setPreviewData(null);
    setExecutionData(null);
    setErrorMessage("");
    setStatus("idle");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Product Import</h1>
          <p className="text-muted-foreground mt-1">
            Upload an Excel file and a ZIP of images to safely create or update products.
          </p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
          <Button variant="outline" size="sm" onClick={() => setStatus("idle")} className="mt-4">
            Try Again
          </Button>
        </Alert>
      )}

      {status === "success" && executionData && (
        <Card className={executionData.failedCount > 0 ? "border-amber-500" : "border-green-200"}>
          <CardHeader className={executionData.failedCount > 0 ? "bg-amber-50 text-amber-900 border-b border-amber-200 pb-4" : "bg-green-50 text-green-900 border-b border-green-200 pb-4"}>
            <CardTitle className="flex items-center gap-2">
              {executionData.failedCount > 0 ? <AlertCircle className="h-5 w-5 text-amber-600" /> : <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {executionData.failedCount > 0 ? "Import Finished with Errors" : "Import Completed Successfully"}
            </CardTitle>
            <CardDescription className={executionData.failedCount > 0 ? "text-amber-800" : "text-green-800"}>
              {executionData.failedCount > 0 ? "Some products failed to upload. Check the details below." : "Your catalog and inventory have been updated."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-3xl font-bold text-green-600">{executionData.createdCount}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Updated</p>
                <p className="text-3xl font-bold text-blue-600">{executionData.updatedCount}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-600">{executionData.failedCount}</p>
              </div>
            </div>
            
            {executionData.failedCount > 0 && executionData.errors?.length > 0 && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-2">Error Details:</h4>
                <ul className="list-disc pl-5 text-sm text-red-800 space-y-1">
                  {executionData.errors.map((err: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-mono font-medium">{err.sku}</span>: {err.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button onClick={reset} className="w-full">Upload Another File</Button>
          </CardContent>
        </Card>
      )}

      {(status === "idle" || status === "previewing") && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Only upload the exact template format generated from this page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="excel-upload" className="font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Products Data File (.xlsx, .csv) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="excel-upload"
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip-upload" className="font-semibold flex items-center gap-2">
                <FileArchive className="h-4 w-4 text-orange-500" />
                Images Archive (.zip)
              </Label>
              <Input
                id="zip-upload"
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Optional. Filenames inside ZIP must match the Excel columns exactly.</p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handlePreview}
              disabled={!excelFile || status === "previewing"}
            >
              <Upload className="h-4 w-4" />
              {status === "previewing" ? "Analyzing Files..." : "Generate Preview"}
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "confirming" && previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Confirm</CardTitle>
            <CardDescription>Please review the impact of this import before committing changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PreviewTable data={previewData} />
            
            <div className="flex gap-4">
              <Button variant="outline" className="w-full" onClick={() => setStatus("idle")}>
                Cancel & Re-upload
              </Button>
              <Button 
                className="w-full gap-2" 
                onClick={handleExecute}
                disabled={previewData.validRows?.length === 0}
              >
                <CheckCircle2 className="h-4 w-4" />
                Execute Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {status === "executing" && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <h3 className="text-xl font-semibold">Executing Import...</h3>
            <p className="text-muted-foreground text-center">
              Please do not close this tab. We are uploading images and synchronizing inventory.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
