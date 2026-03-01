import { useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { labReportsService } from "@/services/lab-reports.service";

export const Route = createFileRoute("/_app/upload")({
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const { mutate: uploadReport, isPending } =
    labReportsService.useUploadLabReport({
      onSuccess: (data: any) => {
        toast.success("Report uploaded! AI is analyzing it now.");
        navigate({ to: "/reports/$id", params: { id: data.id } });
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (title) {
      formData.append("title", title);
    }

    uploadReport({ body: formData });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Upload Lab Report</h1>
      <p className="text-muted-foreground mb-8">
        Upload an image of your lab report for AI analysis
      </p>

      {/* File Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative mb-6">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl border object-cover max-h-80"
          />
          <button
            onClick={clearSelection}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors mb-6"
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium">Click to select an image</p>
          <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: JPG, PNG, WebP
          </p>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <label className="text-sm font-medium block mb-1.5">
          Report Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Blood Test - March 2026"
          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isPending}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Upload & Analyze
          </>
        )}
      </button>

      {/* Info */}
      <div className="bg-primary/5 rounded-xl p-5 mt-8">
        <h3 className="font-semibold text-primary mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm text-primary/80">
          <li>1. AI extracts all test values from the image</li>
          <li>2. Values are compared against reference ranges</li>
          <li>3. AI generates interpretation & recommendations</li>
          <li>4. Risk score calculated based on results</li>
        </ol>
      </div>
    </div>
  );
}
