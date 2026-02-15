"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Download,
  FileText,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  SkipForward,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import {
  IMPORT_CONFIGS,
  autoMapColumns,
  type ImportTarget,
  type FieldConfig,
  type ImportTargetConfig,
} from "./import-config";

interface ImportWizardProps {
  target: ImportTarget;
  onClose: () => void;
  onComplete: (data: Record<string, any>[]) => Promise<void>;
  existingKeys?: Set<string>; // For duplicate detection
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  mapped: Record<string, any>;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
  isDuplicate: boolean;
}

interface ImportStats {
  total: number;
  valid: number;
  errors: number;
  warnings: number;
  duplicates: number;
  skipped: number;
  imported: number;
}

type Step = "upload" | "mapping" | "validation" | "import";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload File" },
  { key: "mapping", label: "Map Columns" },
  { key: "validation", label: "Review" },
  { key: "import", label: "Import" },
];

export function ImportWizard({
  target,
  onClose,
  onComplete,
  existingKeys = new Set(),
}: ImportWizardProps) {
  const config = IMPORT_CONFIGS[target];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isDryRun, setIsDryRun] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Stats
  const stats = useMemo<ImportStats>(() => {
    const total = parsedRows.length;
    const errors = parsedRows.filter((r) => r.errors.length > 0).length;
    const warnings = parsedRows.filter((r) => r.warnings.length > 0).length;
    const duplicates = parsedRows.filter((r) => r.isDuplicate).length;
    const valid = parsedRows.filter(
      (r) => r.errors.length === 0 && (!r.isDuplicate || !skipDuplicates)
    ).length;
    return {
      total,
      valid,
      errors,
      warnings,
      duplicates,
      skipped: skipDuplicates ? duplicates + errors : errors,
      imported: 0,
    };
  }, [parsedRows, skipDuplicates]);

  // File parsing
  const parseFile = useCallback(
    async (file: File): Promise<{ headers: string[]; data: Record<string, string>[] }> => {
      return new Promise((resolve, reject) => {
        const ext = file.name.split(".").pop()?.toLowerCase();

        if (ext === "csv") {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const headers = results.meta.fields || [];
              const data = results.data as Record<string, string>[];
              resolve({ headers, data });
            },
            error: (err) => reject(err),
          });
        } else if (ext === "xlsx" || ext === "xls") {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const workbook = XLSX.read(e.target?.result, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
                defval: "",
              });
              const headers = Object.keys(jsonData[0] || {});
              resolve({ headers, data: jsonData });
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsArrayBuffer(file);
        } else {
          reject(new Error("Unsupported file format"));
        }
      });
    },
    []
  );

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setIsProcessing(true);
      try {
        const { headers, data } = await parseFile(selectedFile);
        setFile(selectedFile);
        setHeaders(headers);
        setRawData(data);

        // Auto-map columns
        const mapping = autoMapColumns(headers, config);
        setColumnMapping(mapping);

        setStep("mapping");
      } catch (err) {
        console.error("File parse error:", err);
        alert("Failed to parse file. Please ensure it's a valid CSV or Excel file.");
      } finally {
        setIsProcessing(false);
      }
    },
    [config, parseFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  // Validation
  const validateAndMapData = useCallback(() => {
    const rows: ParsedRow[] = rawData.map((row, index) => {
      const errors: { field: string; message: string }[] = [];
      const warnings: { field: string; message: string }[] = [];
      const mapped: Record<string, any> = {};

      // Map and validate each field
      for (const field of config.fields) {
        const sourceColumn = columnMapping[field.key];
        const rawValue = sourceColumn ? row[sourceColumn]?.toString().trim() || "" : "";

        // Required field check
        if (field.required && !rawValue) {
          errors.push({ field: field.key, message: `${field.label} is required` });
          continue;
        }

        // Field-specific validation
        if (rawValue && field.validate) {
          const validationError = field.validate(rawValue);
          if (validationError) {
            errors.push({ field: field.key, message: validationError });
            continue;
          }
        }

        // Transform value
        mapped[field.key] = field.transform ? field.transform(rawValue) : rawValue;
      }

      // Check for duplicates
      const uniqueKey = config.uniqueKey;
      const keyValue = mapped[uniqueKey]?.toString().toLowerCase();
      const isDuplicate = keyValue ? existingKeys.has(keyValue) : false;

      if (isDuplicate) {
        warnings.push({
          field: uniqueKey,
          message: `Duplicate ${config.fields.find((f) => f.key === uniqueKey)?.label || uniqueKey}`,
        });
      }

      return {
        rowNumber: index + 2, // +2 for header row and 1-indexed
        data: row,
        mapped,
        errors,
        warnings,
        isDuplicate,
      };
    });

    setParsedRows(rows);
    setStep("validation");
  }, [rawData, config, columnMapping, existingKeys]);

  // Import execution
  const executeImport = useCallback(async () => {
    if (isDryRun) {
      setImportComplete(true);
      return;
    }

    setIsProcessing(true);
    setImportError(null);
    setImportProgress(0);

    try {
      const rowsToImport = parsedRows.filter(
        (r) => r.errors.length === 0 && (!r.isDuplicate || !skipDuplicates)
      );

      const dataToImport = rowsToImport.map((r) => r.mapped);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((p) => Math.min(p + 10, 90));
      }, 100);

      await onComplete(dataToImport);

      clearInterval(progressInterval);
      setImportProgress(100);
      setImportComplete(true);
    } catch (err) {
      console.error("Import error:", err);
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsProcessing(false);
    }
  }, [isDryRun, parsedRows, skipDuplicates, onComplete]);

  // Navigation
  const goToStep = (newStep: Step) => {
    const currentIndex = STEPS.findIndex((s) => s.key === step);
    const newIndex = STEPS.findIndex((s) => s.key === newStep);
    if (newIndex <= currentIndex + 1) {
      setStep(newStep);
    }
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case "upload":
        return file !== null;
      case "mapping":
        // Check required fields are mapped
        return config.fields
          .filter((f) => f.required)
          .every((f) => columnMapping[f.key]);
      case "validation":
        return stats.valid > 0;
      case "import":
        return importComplete;
      default:
        return false;
    }
  }, [step, file, config.fields, columnMapping, stats.valid, importComplete]);

  // Download template
  const downloadTemplate = () => {
    const headers = config.fields.map((f) => f.label);
    const exampleRow = config.fields.map((f) => {
      switch (f.type) {
        case "email":
          return "example@company.com";
        case "phone":
          return "(416) 555-0123";
        case "number":
          return f.key.includes("price") ? "29.99" : "100";
        case "date":
          return "2024-01-15";
        case "select":
          return f.options?.[0] || "";
        default:
          return `Example ${f.label}`;
      }
    });

    const csv = [headers.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${target}-import-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0A0A0A] border border-[#262626] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
          <div>
            <h2 className="text-lg font-semibold text-[#FAFAFA]">Import {config.name}</h2>
            <p className="text-sm text-[#FAFAFA]">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-[#262626]">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const isActive = s.key === step;
              const isPast = STEPS.findIndex((x) => x.key === step) > i;
              return (
                <div key={s.key} className="flex items-center">
                  <button
                    onClick={() => isPast && goToStep(s.key)}
                    disabled={!isPast}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                      isActive && "bg-[rgba(156,74,41,0.15)]",
                      isPast && "cursor-pointer hover:bg-[#0A0A0A]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                        isActive && "bg-[#161616] text-[#0A0A0A]",
                        isPast && "bg-emerald-500/20 text-emerald-400",
                        !isActive && !isPast && "bg-[#0A0A0A] text-[#FAFAFA]"
                      )}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive && "text-[#FAFAFA]",
                        isPast && "text-emerald-400",
                        !isActive && !isPast && "text-[#FAFAFA]"
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-[#0A0A0A]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                  dragOver
                    ? "border-[#262626] bg-[rgba(156,74,41,0.15)]/30"
                    : "border-[#262626] hover:border-[#262626]/40"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#FAFAFA] animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[#FAFAFA]/60" />
                )}
                <p className="text-base font-medium text-[#FAFAFA] mb-1">
                  {isProcessing ? "Processing file..." : "Drop your file here or click to browse"}
                </p>
                <p className="text-sm text-[#FAFAFA]">
                  Supports CSV, XLSX, and XLS files (up to 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* Template download */}
              <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0A0A0A] rounded-lg">
                    <FileText className="w-5 h-5 text-[#FAFAFA]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#FAFAFA]">Download Template</p>
                    <p className="text-xs text-[#FAFAFA]">
                      Get a CSV template with all the correct columns
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FAFAFA] border border-[#262626]/30 rounded-lg hover:bg-[rgba(156,74,41,0.15)]/50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {/* Required fields info */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-400 mb-2">Required Fields</p>
                    <div className="flex flex-wrap gap-2">
                      {config.fields
                        .filter((f) => f.required)
                        .map((f) => (
                          <span
                            key={f.key}
                            className="px-2 py-1 text-xs bg-blue-500/10 text-blue-300 rounded"
                          >
                            {f.label}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#FAFAFA]" />
                  <span className="text-sm text-[#FAFAFA] font-medium">{file?.name}</span>
                  <span className="text-xs text-[#FAFAFA]">({rawData.length} rows)</span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 gap-4 p-3 border-b border-[#262626] bg-[#0A0A0A]">
                  <div className="text-xs font-semibold text-[#FAFAFA] uppercase tracking-wider">
                    Database Field
                  </div>
                  <div className="text-xs font-semibold text-[#FAFAFA] uppercase tracking-wider">
                    CSV Column
                  </div>
                </div>

                <div className="divide-y divide-[#E6D4C7]">
                  {config.fields.map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-2 gap-4 p-3 items-center hover:bg-[#0A0A0A]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#FAFAFA]">{field.label}</span>
                        {field.required && (
                          <span className="text-[10px] text-red-400 font-medium">*</span>
                        )}
                        {field.unique && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/10 text-amber-400 rounded">
                            UNIQUE
                          </span>
                        )}
                      </div>
                      <select
                        value={columnMapping[field.key] || ""}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className={cn(
                          "w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg text-sm focus:outline-none focus:border-[#262626]/50 transition-colors",
                          !columnMapping[field.key] && field.required
                            ? "border-red-500/50 text-red-400"
                            : columnMapping[field.key]
                            ? "border-emerald-500/30 text-[#FAFAFA]"
                            : "border-[#262626] text-[#FAFAFA]"
                        )}
                      >
                        <option value="">-- Not Mapped --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl">
                <p className="text-xs font-semibold text-[#FAFAFA] uppercase tracking-wider mb-3">
                  Data Preview (first 3 rows)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#262626]">
                        {config.fields.slice(0, 5).map((f) => (
                          <th
                            key={f.key}
                            className="text-left px-3 py-2 text-xs font-medium text-[#FAFAFA]"
                          >
                            {f.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-b border-[#262626]/50">
                          {config.fields.slice(0, 5).map((f) => (
                            <td key={f.key} className="px-3 py-2 text-[#FAFAFA] truncate max-w-[150px]">
                              {row[columnMapping[f.key] || ""] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validation */}
          {step === "validation" && (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl">
                  <p className="text-2xl font-bold text-[#FAFAFA]">{stats.total}</p>
                  <p className="text-xs text-[#FAFAFA]">Total Rows</p>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">{stats.valid}</p>
                  <p className="text-xs text-emerald-400/70">Ready to Import</p>
                </div>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
                  <p className="text-xs text-red-400/70">Errors</p>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-amber-400">{stats.duplicates}</p>
                  <p className="text-xs text-amber-400/70">Duplicates</p>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6 p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border border-[#262626] bg-[#0A0A0A] peer-checked:bg-[#161616] peer-checked:border-[#262626] flex items-center justify-center transition-all">
                    {skipDuplicates && <Check className="w-3 h-3 text-[#0A0A0A]" />}
                  </div>
                  <span className="text-sm text-[#FAFAFA]">Skip duplicates</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDryRun}
                    onChange={(e) => setIsDryRun(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border border-[#262626] bg-[#0A0A0A] peer-checked:bg-[#161616] peer-checked:border-[#262626] flex items-center justify-center transition-all">
                    {isDryRun && <Check className="w-3 h-3 text-[#0A0A0A]" />}
                  </div>
                  <span className="text-sm text-[#FAFAFA]">Dry run (preview only)</span>
                </label>
              </div>

              {/* Validation Results Table */}
              <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#0A0A0A] z-10">
                      <tr className="border-b border-[#262626]">
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-wider w-16">
                          Row
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-wider w-20">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-wider">
                          Data
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-wider">
                          Issues
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6D4C7]/50">
                      {parsedRows.slice(0, 100).map((row) => {
                        const hasError = row.errors.length > 0;
                        const hasWarning = row.warnings.length > 0;
                        const willSkip =
                          hasError || (row.isDuplicate && skipDuplicates);

                        return (
                          <tr
                            key={row.rowNumber}
                            className={cn(
                              "transition-colors",
                              hasError && "bg-red-500/5",
                              !hasError && hasWarning && "bg-amber-500/5"
                            )}
                          >
                            <td className="px-4 py-3 text-xs text-[#FAFAFA] font-mono">
                              {row.rowNumber}
                            </td>
                            <td className="px-4 py-3">
                              {hasError ? (
                                <span className="flex items-center gap-1 text-red-400">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs">Error</span>
                                </span>
                              ) : row.isDuplicate ? (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="text-xs">Duplicate</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-emerald-400">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs">Valid</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-[#FAFAFA]">
                              {Object.values(row.mapped).slice(0, 3).join(" | ")}
                            </td>
                            <td className="px-4 py-3">
                              {row.errors.length > 0 && (
                                <div className="text-xs text-red-400">
                                  {row.errors.map((e, i) => (
                                    <div key={i}>
                                      {e.field}: {e.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {row.warnings.length > 0 && (
                                <div className="text-xs text-amber-400">
                                  {row.warnings.map((w, i) => (
                                    <div key={i}>
                                      {w.field}: {w.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 100 && (
                  <div className="px-4 py-2 text-xs text-[#FAFAFA] bg-[#0A0A0A] border-t border-[#262626]">
                    Showing first 100 rows of {parsedRows.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Import */}
          {step === "import" && (
            <div className="flex flex-col items-center justify-center py-12">
              {!importComplete && !importError && (
                <>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-16 h-16 text-[#FAFAFA] animate-spin mb-6" />
                      <p className="text-lg font-medium text-[#FAFAFA] mb-2">
                        Importing {stats.valid} records...
                      </p>
                      <div className="w-64 h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#161616] transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-[#FAFAFA] mt-2">{importProgress}%</p>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-16 h-16 text-[#FAFAFA]/40 mb-6" />
                      <p className="text-lg font-medium text-[#FAFAFA] mb-2">
                        Ready to import {stats.valid} records
                      </p>
                      <p className="text-sm text-[#FAFAFA] mb-6">
                        {stats.skipped > 0 && `${stats.skipped} rows will be skipped`}
                        {isDryRun && " (Dry run - no data will be saved)"}
                      </p>
                      <button
                        onClick={executeImport}
                        className="flex items-center gap-2 px-6 py-3 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-colors"
                      >
                        {isDryRun ? "Complete Dry Run" : "Start Import"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}

              {importComplete && (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <p className="text-xl font-semibold text-[#FAFAFA] mb-2">
                    {isDryRun ? "Dry Run Complete" : "Import Complete!"}
                  </p>
                  <p className="text-sm text-[#FAFAFA] mb-6">
                    {isDryRun
                      ? `${stats.valid} records would be imported`
                      : `Successfully imported ${stats.valid} records`}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-colors"
                  >
                    Done
                  </button>
                </>
              )}

              {importError && (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <p className="text-xl font-semibold text-[#FAFAFA] mb-2">Import Failed</p>
                  <p className="text-sm text-red-400 mb-6">{importError}</p>
                  <button
                    onClick={() => {
                      setImportError(null);
                      setStep("validation");
                    }}
                    className="px-6 py-2.5 border border-[#262626] text-[#FAFAFA] rounded-lg text-sm font-medium hover:bg-[#0A0A0A] transition-colors"
                  >
                    Go Back
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!importComplete && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#262626] bg-[#0A0A0A]">
            <button
              onClick={() => {
                const currentIndex = STEPS.findIndex((s) => s.key === step);
                if (currentIndex > 0) {
                  setStep(STEPS[currentIndex - 1].key);
                }
              }}
              disabled={step === "upload"}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                step === "upload"
                  ? "text-[#FAFAFA] cursor-not-allowed"
                  : "text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => {
                if (step === "mapping") {
                  validateAndMapData();
                } else if (step === "validation") {
                  setStep("import");
                }
              }}
              disabled={!canProceed || step === "import"}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                canProceed && step !== "import"
                  ? "bg-[#161616] text-[#0A0A0A] hover:bg-[#161616]"
                  : "bg-[#0A0A0A] text-[#FAFAFA] cursor-not-allowed"
              )}
            >
              {step === "mapping" ? "Validate Data" : step === "validation" ? "Continue to Import" : "..."}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
