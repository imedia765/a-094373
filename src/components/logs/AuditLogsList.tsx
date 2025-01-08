import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types/audit';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

export const AuditLogsList: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .range(0, 49);

        if (error) throw error;
        setLogs(data as AuditLog[] || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "Error fetching logs",
          description: "There was a problem loading the audit logs.",
          variant: "destructive"
        });
      }
    };

    fetchLogs();

    // Set up real-time subscription
    const subscription = supabase
      .channel('audit_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('New audit log event:', payload);
          setLogs(prevLogs => {
            const newLog = payload.new as AuditLog;
            return [newLog, ...prevLogs.slice(0, 49)];
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No audit logs available</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-card rounded-md shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span
                    data-testid={`severity-${log.id}`}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityClass(log.severity)}`}
                  >
                    {log.severity}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Operation:</span> {log.operation}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Table:</span> {log.table_name}
                  </p>
                  {log.record_id && (
                    <p className="text-sm">
                      <span className="font-medium">Record ID:</span> {log.record_id}
                    </p>
                  )}
                  {log.old_values && (
                    <details className="text-sm">
                      <summary className="cursor-pointer hover:text-primary">
                        Old Values
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </details>
                  )}
                  {log.new_values && (
                    <details className="text-sm">
                      <summary className="cursor-pointer hover:text-primary">
                        New Values
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};