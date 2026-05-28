'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API_URL } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [datasets, setDatasets] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDatasets();
  }, [router]);

  const fetchDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/datasets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatasets(res.data);
    } catch (error) {
      console.error('Failed to fetch datasets', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/datasets/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setUploadStatus('success');
      setFile(null);
      fetchDatasets(); // Refresh list
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-neutral-950 text-neutral-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-neutral-400">Upload and manage your data for AI cleaning and analytics.</p>
        </div>

        <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50">
          <CardHeader>
            <CardTitle>Upload Dataset</CardTitle>
            <CardDescription className="text-neutral-400">
              Drag and drop your CSV, JSON, or Excel file here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${file ? 'border-neutral-500 bg-neutral-800/50' : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/30'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileChange}
              />
              
              {!file ? (
                <div className="flex flex-col items-center cursor-pointer">
                  <UploadCloud className="h-10 w-10 text-neutral-400 mb-4" />
                  <p className="text-lg font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-neutral-400 mt-1">CSV, JSON, XLSX up to 50MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <File className="h-10 w-10 text-blue-400 mb-4" />
                  <p className="text-lg font-medium text-blue-100">{file.name}</p>
                  <p className="text-sm text-neutral-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {uploadStatus === 'success' && (
              <div className="mt-4 flex items-center text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Dataset uploaded successfully! AI profiling started.
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="mt-4 flex items-center text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" /> Failed to upload dataset.
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                disabled={!file || uploading}
                onClick={uploadFile}
                className="bg-white text-black hover:bg-neutral-200"
              >
                {uploading ? 'Uploading...' : 'Upload to Platform'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List Datasets */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Datasets</h2>
          {datasets.length === 0 ? (
            <p className="text-neutral-500">No datasets uploaded yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {datasets.map(dataset => (
                <div key={dataset.id} onClick={() => router.push(`/dashboard/${dataset.id}`)} className="cursor-pointer">
                  <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 hover:border-neutral-500 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg truncate" title={dataset.name}>{dataset.name}</CardTitle>
                      <CardDescription className="text-neutral-400">
                        Status: <span className={dataset.status === 'READY' ? 'text-green-400' : 'text-yellow-400'}>{dataset.status}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-neutral-400">
                      {dataset.rowCount ? `${dataset.rowCount} rows` : 'Profiling...'}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
