import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { AlertOctagon, Database, Shield, Info, Users, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

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

  const formatDetails = (details: any) => {
    if (typeof details === 'string') return details;
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="mb-1">
        <span className="font-medium text-dashboard-accent1">{key}:</span>{' '}
        <span className="text-dashboard-text">{JSON.stringify(value, null, 2)}</span>
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-medium mb-2 text-white">System Tools</h1>
        <p className="text-dashboard-muted">Manage and monitor system health</p>
      </header>

      <Card className="bg-dashboard-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-dashboard-accent1" />
              <CardTitle className="text-xl text-white">System Health Check</CardTitle>
            </div>
            <Button 
              onClick={runSystemChecks}
              disabled={isRunningChecks}
              className="bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
            >
              Run System Checks
            </Button>
          </div>
          <CardDescription className="text-dashboard-muted">
            Comprehensive system analysis and security audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md">
            {isRunningChecks ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-accent1"></div>
              </div>
            ) : systemChecks.length > 0 ? (
              <div className="space-y-4">
                {systemChecks.map((check, index) => (
                  <Card 
                    key={index}
                    className={`border ${getStatusColor(check.status)} bg-dashboard-card/50`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <CardTitle className="text-lg">
                          {check.check_type}
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(check.status)}`}>
                            {check.status}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="text-sm space-y-2">
                        {formatDetails(check.details)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashboard-accent1/20 bg-dashboard-card/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-dashboard-accent1" />
                    <CardTitle>No Issues Found</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-dashboard-text">
                    All system checks passed successfully.
                  </p>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemToolsView;