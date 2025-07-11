'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type AIOperationType = 'enhance' | 'remove_object' | 'style_transfer' | 'text_to_image' | 'avatar_generation';

export interface AIProcessingResult {
  success: boolean;
  processedUrl?: string;
  error?: string;
  creditsUsed?: number;
}

interface AIModel {
  id: string;
  name: string;
  model_type: AIOperationType;
  endpoint: string;
  credit_cost: number;
  enabled: boolean;
  config: any;
  created_at: string;
}

export function useAI() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);

  const fetchAvailableModels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;
      setAvailableModels(data || []);
    } catch (error) {
      console.error('Error fetching AI models:', error);
    }
  }, []);

  const processImage = useCallback(async (
    file: File,
    operationType: AIOperationType,
    options: Record<string, any> = {}
  ): Promise<AIProcessingResult> => {
    setProcessing(true);
    setProgress(0);

    try {
      // Upload image to Supabase Storage
      setProgress(20);
      
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      setProgress(40);

      // Call Supabase Edge Function for AI processing
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: publicUrl,
          operationType,
          options
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      const result = await response.json();
      setProgress(100);

      return {
        success: true,
        processedUrl: result.processedUrl,
        creditsUsed: result.creditsUsed,
      };

    } catch (error) {
      console.error('AI processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, []);

  const generateTextToImage = useCallback(async (
    prompt: string,
    options: Record<string, any> = {}
  ): Promise<AIProcessingResult> => {
    setProcessing(true);
    setProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      setProgress(30);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/text-to-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const result = await response.json();
      setProgress(100);

      return {
        success: true,
        processedUrl: result.imageUrl,
        creditsUsed: result.creditsUsed,
      };

    } catch (error) {
      console.error('Text-to-image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, []);

  return {
    processing,
    progress,
    availableModels,
    fetchAvailableModels,
    processImage,
    generateTextToImage,
  };
}

      setProgress(30);

      // Generate a placeholder image URL for demo
      const imageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
      
      setProgress(70);

      // Create image record
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .insert({
          user_id: user.id,
          original_url: '',
          processed_url: imageUrl,
          operation_type: 'text_to_image',
          credits_used: model.credit_cost,
          processing_status: 'completed',
          metadata: { prompt, ...options },
        })
        .select()
        .single();

      if (imageError) throw imageError;

      // Deduct credits
      setProgress(90);
      const { error: creditError } = await supabase
        .from('users')
        .update({ 
          credits: userData.credits - model.credit_cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (creditError) throw creditError;

      // Record transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -model.credit_cost,
          transaction_type: 'usage',
          description: `Text-to-image generation`,
        });

      setProgress(100);

      return {
        success: true,
        processedUrl: imageUrl,
        creditsUsed: model.credit_cost,
      };

    } catch (error) {
      console.error('Text-to-image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [availableModels]);

  return {
    processing,
    progress,
    availableModels,
    fetchAvailableModels,
    processImage,
    generateTextToImage,
  };
}