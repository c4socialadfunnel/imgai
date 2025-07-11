'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/useAI';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Eraser,
  PaintBucket,
  FileImage,
  UserCircle,
  Upload,
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export function QuickActions() {
  const router = useRouter();
  const { user } = useAuth();
  const { processing, progress, generateTextToImage } = useAI();
  const [textToImagePrompt, setTextToImagePrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickActions = [
    {
      title: 'Enhance Image',
      description: 'Improve quality and resolution',
      icon: Sparkles,
      color: 'from-blue-500 to-purple-600',
      href: '/tools/enhance',
      credits: 2,
    },
    {
      title: 'Remove Object',
      description: 'Clean unwanted elements',
      icon: Eraser,
      color: 'from-red-500 to-pink-600',
      href: '/tools/remove',
      credits: 3,
    },
    {
      title: 'Style Transfer',
      description: 'Apply artistic styles',
      icon: PaintBucket,
      color: 'from-green-500 to-emerald-600',
      href: '/tools/style',
      credits: 4,
    },
    {
      title: 'Create Avatar',
      description: 'Generate AI avatars',
      icon: UserCircle,
      color: 'from-orange-500 to-red-600',
      href: '/tools/avatar',
      credits: 6,
    },
  ];

  const handleTextToImage = async () => {
    if (!textToImagePrompt.trim()) return;

    setError(null);
    setResult(null);

    if ((user?.credits || 0) < 5) {
      setError('Insufficient credits. You need at least 5 credits to generate an image.');
      return;
    }

    try {
      const response = await generateTextToImage(textToImagePrompt);
      
      if (response.success) {
        setResult(response.processedUrl!);
        setTextToImagePrompt('');
      } else {
        setError(response.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card 
            key={action.title} 
            className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => router.push(action.href)}
          >
            <CardHeader className="pb-2">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-2`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {action.credits} credits
                </span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileImage className="h-5 w-5" />
            <span>Quick Text-to-Image</span>
          </CardTitle>
          <CardDescription>
            Generate images from text descriptions (5 credits)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating image...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Image generated successfully! Check your gallery to view and download.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your image</Label>
            <Textarea
              id="prompt"
              placeholder="A futuristic city at sunset with flying cars..."
              value={textToImagePrompt}
              onChange={(e) => setTextToImagePrompt(e.target.value)}
              disabled={processing}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Your credits: {user?.credits || 0}
            </span>
            <Button
              onClick={handleTextToImage}
              disabled={processing || !textToImagePrompt.trim() || (user?.credits || 0) < 5}
              className="flex items-center space-x-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Image</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}