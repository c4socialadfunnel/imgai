'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Coins, 
  ImageIcon, 
  Clock, 
  TrendingUp,
  Sparkles,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardStatsProps {
  className?: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalImages: 0,
    imagesThisMonth: 0,
    creditsUsedThisMonth: 0,
    averageProcessingTime: 0,
    mostUsedOperation: '',
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get total images
      const { count: totalImages } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get images this month
      const { count: imagesThisMonth } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      // Get credits used this month
      const { data: creditTransactions } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('transaction_type', 'usage')
        .gte('created_at', firstDayOfMonth.toISOString());

      const creditsUsedThisMonth = Math.abs(
        creditTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      );

      // Get most used operation
      const { data: operationStats } = await supabase
        .from('images')
        .select('operation_type')
        .eq('user_id', user.id);

      const operationCounts = operationStats?.reduce((acc, img) => {
        acc[img.operation_type] = (acc[img.operation_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const mostUsedOperation = Object.entries(operationCounts).sort(
        ([,a], [,b]) => b - a
      )[0]?.[0] || '';

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalImages: totalImages || 0,
        imagesThisMonth: imagesThisMonth || 0,
        creditsUsedThisMonth,
        averageProcessingTime: 2.3, // Mock data
        mostUsedOperation,
        recentActivity: recentActivity || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOperationType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.creditsUsedThisMonth} used this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.imagesThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Tool</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.mostUsedOperation ? formatOperationType(stats.mostUsedOperation) : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Your go-to AI tool
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent activity. Start by editing some images!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{formatOperationType(activity.operation_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Coins className="h-3 w-3" />
                    <span>{activity.credits_used}</span>
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}