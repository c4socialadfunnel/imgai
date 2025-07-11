'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Sparkles, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Coins
} from 'lucide-react';

export default function EnhancePage() {
  const { user, loading } = useAuth();
  const { processing, progress, processImage } = useAI();
  const router = useRouter();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedUrl(null);
      setError(null);
      setSuccess(null);
    }
  }, []);

  const handleEnhance = async () => {
    if (!selectedFile) return;

    setError(null);
    setSuccess(null);

    if ((user?.credits || 0) < 2) {
      setError('Insufficient credits. You need at least 2 credits to enhance an image.');
      return;
    }

    try {
      const result = await processImage(selectedFile, 'enhance', {
        quality: 'high',
        upscale: true,
      });

      if (result.success) {
        setProcessedUrl(result.processedUrl!);
        setSuccess(`Image enhanced successfully! Used ${result.creditsUsed} credits.`);
      } else {
        setError(result.error || 'Enhancement failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleDownload = () => {
    if (processedUrl) {
      const link = document.createElement('a');
      link.href = processedUrl;
      link.download = 'enhanced-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-blue-500" />
                <span>AI Image Enhancement</span>
              </h1>
              <p className="text-muted-foreground">
                Improve image quality, resolution, and clarity using advanced AI algorithms.
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Coins className="h-3 w-3" />
                  <span>2 credits per enhancement</span>
                </Badge>
                <Badge variant="outline">
                  Your credits: {user.credits}
                </Badge>
              </div>
            </div>

            {processing && (
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">Enhancing your image...</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      This may take a few moments depending on image size and complexity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload Image</span>
                  </CardTitle>
                  <CardDescription>
                    Select an image to enhance. Supported formats: JPG, PNG, WebP (max 10MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{selectedFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">Drop your image here</p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={processing}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleEnhance}
                      disabled={!selectedFile || processing || (user.credits < 2)}
                      className="flex-1"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance Image
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={processing}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Result Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Enhanced Result</span>
                  </CardTitle>
                  <CardDescription>
                    Your enhanced image will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                    {processedUrl ? (
                      <div className="space-y-4 w-full">
                        <img
                          src={processedUrl}
                          alt="Enhanced"
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">Enhancement Complete!</p>
                          <p className="text-xs text-muted-foreground">
                            Image quality and resolution improved
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          Enhanced image will appear here
                        </p>
                      </div>
                    )}
                  </div>

                  {processedUrl && (
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Enhanced Image
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhancement Options */}
            <Card>
              <CardHeader>
                <CardTitle>Enhancement Features</CardTitle>
                <CardDescription>
                  Our AI enhancement includes the following improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 rounded-lg border">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Quality Boost</h3>
                    <p className="text-sm text-muted-foreground">Reduce noise and artifacts</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium">Resolution</h3>
                    <p className="text-sm text-muted-foreground">Upscale to higher resolution</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Sharpening</h3>
                    <p className="text-sm text-muted-foreground">Enhance edge definition</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-medium">Color Correction</h3>
                    <p className="text-sm text-muted-foreground">Optimize colors and contrast</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}