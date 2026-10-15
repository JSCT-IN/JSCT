'use client';

import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Loader2, 
  Table, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { bulkImportMembersAction, CsvMemberRow, ImportResult } from '@/actions/bulk-import-actions';

interface BulkCsvImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkCsvImporterModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkCsvImporterModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<CsvMemberRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Simple CSV parser
  const parseCsvText = (text: string): CsvMemberRow[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const rows: CsvMemberRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV split accounting for quotes
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cleanValues = values.map((v) => v.replace(/^["']|["']$/g, '').trim());

      const rowObj: any = {};
      headers.forEach((header, idx) => {
        const val = cleanValues[idx] || '';
        if (header.includes('name') && !header.includes('nominee') && !header.includes('father')) {
          rowObj.full_name = val;
        } else if (header.includes('father') || header.includes('husband')) {
          rowObj.father_or_husband_name = val;
        } else if (header.includes('phone') || header.includes('mobile')) {
          rowObj.mobile = val;
        } else if (header.includes('district') || header.includes('zila')) {
          rowObj.district = val;
        } else if (header.includes('department') || header.includes('vibhag')) {
          rowObj.department = val;
        } else if (header.includes('designation') || header.includes('pad')) {
          rowObj.designation = val;
        } else if (header.includes('block') || header.includes('tehsil')) {
          rowObj.block = val;
        } else if (header.includes('utr') || header.includes('transaction')) {
          rowObj.transaction_id = val;
        } else {
          rowObj[header] = val;
        }
      });

      if (rowObj.full_name || rowObj.mobile) {
        rows.push(rowObj);
      }
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    setImportResult(null);

    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (!uploaded.name.endsWith('.csv')) {
      setParseError('कृपया केवल .csv प्रारूप की फाइल अपलोड करें (Please upload a valid CSV file).');
      return;
    }

    setFile(uploaded);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const rows = parseCsvText(content);
        if (rows.length === 0) {
          setParseError('CSV फाइल रिक्त है अथवा हेडर पंक्ति नहीं मिली।');
        } else {
          setParsedRows(rows);
        }
      } catch (err: any) {
        setParseError(`CSV पढ़ने में त्रुटि: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(uploaded);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setParseError(null);

    try {
      const res = await bulkImportMembersAction(parsedRows);
      setImportResult(res);
      if (res.importedCount > 0) {
        onSuccess();
      }
    } catch (e: any) {
      setParseError(`बल्क आयात त्रुटि: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Sample CSV Template Downloader
  const downloadSampleCsv = () => {
    const sampleHeaders = 'full_name,mobile,father_or_husband_name,district,block,department,designation,transaction_id\n';
    const sampleRows = 
      'Rajesh Verma,9876543220,Ramesh Verma,Gorakhpur,Sadar,शिक्षा विभाग,सहायक अध्यापक,UTR9876543201\n' +
      'Pooja Sharma,9876543221,Anand Sharma,Lucknow,Hazratganj,स्वास्थ्य विभाग,स्टाफ नर्स,UTR9876543202\n';
    
    const blob = new Blob([sampleHeaders + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'JSCT_Member_Import_Sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-deep/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-stone-border rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto relative shadow-warm-lg space-y-6 text-charcoal">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta border border-terracotta/20 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-charcoal font-editorial">
                थोक सदस्य आयात इंजन (Bulk Member CSV Import)
              </h3>
              <p className="text-xs text-driftwood">
                CSV डाटा मैपिंग, डुप्लीकेट जांच, एवं स्वचालित डेटाबेस प्रविष्टि
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-canvas-inset hover:bg-stone-border/60 text-driftwood hover:text-charcoal transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions & Template Download */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-canvas-inset/50 border border-stone-border">
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-charcoal">मानक CSV प्रारूप आवश्यक (Required Columns):</p>
            <p className="text-driftwood">
              <code className="text-terracotta font-mono font-bold">full_name</code>, <code className="text-terracotta font-mono font-bold">mobile</code> (10 अंक), <code className="text-terracotta font-mono font-bold">district</code>, <code className="text-terracotta font-mono font-bold">department</code>, <code className="text-terracotta font-mono font-bold">transaction_id</code>
            </p>
          </div>
          <button
            onClick={downloadSampleCsv}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-canvas-inset text-charcoal text-xs font-bold transition-all border border-stone-border flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-driftwood" />
            <span>नमूना CSV डाउनलोड</span>
          </button>
        </div>

        {/* Dropzone */}
        {!importResult && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-stone-border hover:border-terracotta rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-canvas-inset/30 hover:bg-canvas-inset/60 transition-all text-center">
              <UploadCloud className="w-10 h-10 text-terracotta mb-2" />
              <p className="text-xs font-bold text-charcoal">
                {file ? file.name : 'CSV फ़ाइल यहाँ खींचें अथवा चुनने के लिए क्लिक करें'}
              </p>
              <p className="text-[11px] text-driftwood mt-1">
                केवल .csv प्रारूप समर्थित (Max 5MB)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {parseError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-terracotta">
                    पहचाने गए रिकॉर्ड्स: {parsedRows.length} पंक्तियाँ
                  </span>
                  <span className="text-driftwood">प्रथम 4 रिकॉर्ड्स का पूर्वावलोकन:</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-border bg-white">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-canvas-inset/80 text-driftwood-dark border-b border-stone-border font-bold uppercase">
                      <tr>
                        <th className="py-2 px-3">पूरा नाम</th>
                        <th className="py-2 px-3">मोबाइल</th>
                        <th className="py-2 px-3">जनपद</th>
                        <th className="py-2 px-3">विभाग</th>
                        <th className="py-2 px-3">Transaction / UTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-border/60 text-charcoal">
                      {parsedRows.slice(0, 4).map((r, i) => (
                        <tr key={i} className="hover:bg-canvas-inset/40">
                          <td className="py-2 px-3 font-semibold text-charcoal">{r.full_name}</td>
                          <td className="py-2 px-3 text-terracotta font-mono">{r.mobile}</td>
                          <td className="py-2 px-3">{r.district || 'Gorakhpur'}</td>
                          <td className="py-2 px-3">{r.department || 'शिक्षा विभाग'}</td>
                          <td className="py-2 px-3 text-driftwood font-mono">{r.transaction_id || 'AUTO'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleExecuteImport}
                  disabled={isImporting}
                  className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-warm disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>डेटाबेस में बल्क इन्सर्ट जारी है...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>{parsedRows.length} सदस्यों का डेटाबेस में आयात करें (Execute Import)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Import Results View */}
        {importResult && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-canvas-inset/30 border border-stone-border space-y-3">
              <div className="flex items-center gap-2.5 text-sage">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-base text-charcoal font-editorial">
                  थोक आयात परिणाम सारांश (Import Summary)
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
                <div className="p-3 rounded-xl bg-white border border-stone-border">
                  <span className="text-driftwood text-[10px] uppercase block">कुल विश्लेषित</span>
                  <span className="text-lg font-bold text-charcoal mt-1 block">{importResult.totalParsed}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 text-[10px] uppercase block font-semibold">सफलतापूर्वक आयातित</span>
                  <span className="text-lg font-bold text-emerald-800 mt-1 block">{importResult.importedCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-800 text-[10px] uppercase block font-semibold">छोड़े गए / डुप्लीकेट</span>
                  <span className="text-lg font-bold text-amber-800 mt-1 block">{importResult.skippedCount}</span>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <p className="text-[11px] font-bold text-rose-800">विवरण एवं चेतावनियाँ:</p>
                  <ul className="text-[10px] text-rose-700 space-y-0.5 list-disc list-inside max-h-32 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li>...एवं {importResult.errors.length - 10} अन्य प्रविष्टियां।</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setImportResult(null);
                  setParsedRows([]);
                  setFile(null);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-canvas-inset text-charcoal text-xs font-bold transition-all border border-stone-border"
              >
                अन्य फ़ाइल आयात करें
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold transition-all shadow-warm"
              >
                पूर्ण (Done)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
