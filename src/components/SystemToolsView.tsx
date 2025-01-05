import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import MemberNumberVerification from './system/MemberNumberVerification';
import SecurityAudit from './system/SecurityAudit';

const SystemToolsView = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCheckingMembers, setIsCheckingMembers] = useState(false);
  const [isAuditingSecurity, setIsAuditingSecurity] = useState(false);

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

        // Only invalidate queries if we have a valid session
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

  const handleCheckComplete = (success: boolean) => {
    toast({
      title: success ? "Member Check Complete" : "Error Checking Members",
      description: success 
        ? "Member number verification has been completed."
        : "An error occurred while checking members.",
      variant: success ? "default" : "destructive",
    });
  };

  const handleAuditComplete = (success: boolean) => {
    toast({
      title: success ? "Security Audit Complete" : "Error Running Security Audit",
      description: success 
        ? "Security settings have been audited."
        : "An error occurred while running the security audit.",
      variant: success ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-medium mb-2 text-white">System Tools</h1>
        <p className="text-dashboard-muted">Manage and monitor system health</p>
      </header>

      <div className="grid gap-6">
        <MemberNumberVerification 
          isCheckingMembers={isCheckingMembers}
          setIsCheckingMembers={setIsCheckingMembers}
          onCheckComplete={handleCheckComplete}
        />
        <SecurityAudit 
          isAuditingSecurity={isAuditingSecurity}
          setIsAuditingSecurity={setIsAuditingSecurity}
          onAuditComplete={handleAuditComplete}
        />
      </div>
    </div>
  );
};

export default SystemToolsView;