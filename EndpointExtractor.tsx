'use client';

import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { AlertCircle, Copy, Check, Loader2, Zap } from 'lucide-react';

interface Endpoint {
  path: string;
  method?: string;
  status?: number;
}

export default function EndpointExtractor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractEndpoints = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setEndpoints([]);

    // Mock KOSMOS-2.5 processing
    setTimeout(() => {
      const mockEndpoints: Endpoint[] = [
        { path: '/user/free-coins', method: 'GET', status: 200 },
        { path: '/user/redeem', method: 'POST', status: 200 },
        { path: '/user/balance', method: 'GET', status: 200 },
        { path: '/api/v2/payments/credits', method: 'GET', status: 200 },
        { path: '/api/v1/wallet/deposit', method: 'POST', status: 200 },
      ];
      
      setEndpoints(mockEndpoints);
      setIsLoading(false);
    }, 2000);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Zap className="w-10 h-10 text-yellow-400" />
              KOSMOS-2.5 Endpoint Extractor
            </h1>
            <p className="text-gray-400">Upload a screenshot → Get API endpoints in seconds</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Screenshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  </label>
                </div>

                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                    <Button
                      onClick={extractEndpoints}
                      disabled={isLoading}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Extract Endpoints
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Extracted Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                {endpoints.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {endpoints.map((endpoint, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between group">
                          <div className="flex items-center gap-3 flex-1">
                            {endpoint.method && (
                              <Badge variant={endpoint.status === 200 ? "default" : "secondary"} className="font-mono">
                                {endpoint.method}
                              </Badge>
                            )}
                            <code className="text-sm font-mono text-green-400 break-all">
                              {endpoint.path}
                            </code>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(endpoint.path, index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {isLoading ? (
                      <div className="space-y-2">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        <p>KOSMOS-2.5 is analyzing your screenshot...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-600" />
                        <p>No endpoints found yet</p>
                        <p className="text-xs">Upload a screenshot to begin</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>KOSMOS-2.5 • 85% OCR Accuracy • 92% Markdown Extraction</p>
          </div>
        </div>
      </div>
    </>
  );
}