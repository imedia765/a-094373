import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { AlertOctagon, Database, Shield, Info, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SystemCheck {
  check_type: string;
  status: string;
  details: any;
}

const SystemToolsView = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([]);

  // Check auth status and invalidate queries when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error('Auth error:', error);
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['security_audit'] });
        queryClient.invalidateQueries({ queryKey: ['member_number_check'] });
      } catch (error) {
        console.error('Session check error:', error);
        toast({
          title: "Session Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    checkAuth();
  }, [queryClient, toast, navigate]);

  const runSystemChecks = async () => {
    console.log('Starting system checks...');
    setIsRunningChecks(true);
    setSystemChecks([]);

    try {
      // Run security audit
      const { data: securityData, error: securityError } = await supabase.rpc('audit_security_settings');
      if (securityError) throw securityError;

      // Run member number checks
      const { data: memberData, error: memberError } = await supabase.rpc('check_member_numbers');
      if (memberError) throw memberError;

      // Run role validation checks
      const { data: roleData, error: roleError } = await supabase.rpc('validate_user_roles');
      if (roleError) throw roleError;

      // Transform member data to match SystemCheck interface
      const memberChecks = (memberData || []).map((check: any) => ({
        check_type: check.issue_type,
        status: 'Warning',
        details: {
          description: check.description,
          affected_table: check.affected_table,
          member_number: check.member_number,
          ...check.details
        }
      }));

      // Combine all checks ensuring they match SystemCheck interface
      const allChecks: SystemCheck[] = [
        ...(securityData || []),
        ...memberChecks,
        ...(roleData || [])
      ];

      setSystemChecks(allChecks);
      toast({
        title: "System Checks Complete",
        description: `Found ${allChecks.length} items to review`,
      });
    } catch (error) {
      console.error('Error running system checks:', error);
      toast({
        title: "Error Running Checks",
        description: "An error occurred while running system checks",
        variant: "destructive",
      });
    } finally {
      setIsRunningChecks(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-medium mb-2 text-white">System Tools</h1>
        <p className="text-dashboard-muted">Manage and monitor system health</p>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <h2 className="text-xl font-medium text-white">System Health Check</h2>
          </div>
          <Button 
            onClick={runSystemChecks}
            disabled={isRunningChecks}
          >
            Run System Checks
          </Button>
        </div>

        <ScrollArea className="h-[600px] w-full rounded-md border border-white/10 bg-dashboard-card p-4">
          {isRunningChecks ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-accent1"></div>
            </div>
          ) : systemChecks.length > 0 ? (
            <div className="space-y-4">
              {systemChecks.map((check, index) => (
                <Alert 
                  key={index}
                  variant={check.status.toLowerCase() === 'critical' ? 'destructive' : 'default'}
                  className="border-white/10"
                >
                  {getStatusIcon(check.status)}
                  <AlertTitle className="flex items-center gap-2">
                    {check.check_type}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      check.status.toLowerCase() === 'critical' 
                        ? 'bg-red-500/20 text-red-400'
                        : check.status.toLowerCase() === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {check.status}
                    </span>
                  </AlertTitle>
                  <AlertDescription>
                    <pre className="mt-2 p-2 bg-black/10 rounded text-sm overflow-x-auto">
                      {JSON.stringify(check.details, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Issues Found</AlertTitle>
              <AlertDescription>
                All system checks passed successfully.
              </AlertDescription>
            </Alert>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SystemToolsView;