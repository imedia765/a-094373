import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Activity } from 'lucide-react';
import AuditLogsList from '@/components/logs/AuditLogsList';
import MonitoringLogsList from '@/components/logs/MonitoringLogsList';
import { AuditLog } from '@/types/audit';
import { MonitoringLog } from '@/types/monitoring';

const AuditLogsView = () => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
  };

  const { data: auditLogs, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      console.log('Fetching audit logs...');
      addDebugLog('Fetching initial audit logs');
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        addDebugLog(`Error fetching audit logs: ${error.message}`);
        throw error;
      }

      addDebugLog(`Fetched ${data?.length || 0} audit logs`);
      return data?.map(log => ({
        ...log,
        old_values: log.old_values as Record<string, any> | null,
        new_values: log.new_values as Record<string, any> | null
      })) as AuditLog[];
    },
  });

  const { data: monitoringLogs, isLoading: isLoadingMonitoring } = useQuery({
    queryKey: ['monitoringLogs'],
    queryFn: async () => {
      console.log('Fetching monitoring logs...');
      addDebugLog('Fetching monitoring logs');
      const { data, error } = await supabase
        .from('monitoring_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching monitoring logs:', error);
        addDebugLog(`Error fetching monitoring logs: ${error.message}`);
        throw error;
      }

      addDebugLog(`Fetched ${data?.length || 0} monitoring logs`);
      return data?.map(log => ({
        ...log,
        details: log.details as Record<string, any> | null
      })) as MonitoringLog[];
    },
  });

  useEffect(() => {
    addDebugLog('Setting up real-time subscription');
    const channel = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          addDebugLog(`Real-time update received: ${payload.eventType}`);
          // Force a refetch when we receive updates
          window.location.reload();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'monitoring_logs'
        },
        (payload) => {
          addDebugLog(`Real-time update received: ${payload.eventType}`);
          // Force a refetch when we receive updates
          window.location.reload();
        }
      )
      .subscribe((status) => {
        addDebugLog(`Subscription status: ${status}`);
      });

    return () => {
      addDebugLog('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoadingAudit || isLoadingMonitoring) {
    return <div className="text-white">Loading logs...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-medium mb-2 text-white">System Logs</h1>
        <p className="text-dashboard-text">View system activity, changes, and monitoring data</p>
      </header>

      <div className="space-y-6">
        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="audit" className="mt-6">
            <div className="glass-card p-6">
              <AuditLogsList logs={auditLogs || []} />
            </div>
          </TabsContent>
          
          <TabsContent value="monitoring" className="mt-6">
            <div className="glass-card p-6">
              <MonitoringLogsList logs={monitoringLogs || []} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4 text-white">Debug Console</h2>
          <ScrollArea className="h-[200px] rounded-md border border-white/10 bg-black/20">
            <div className="p-4 space-y-2">
              {debugLogs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-dashboard-text">
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default AuditLogsView;
