import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRoutesProps {
  session: Session | null;
}

const AuthWrapper = ({ session }: { session: Session | null }) => {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Navigation error:', event.error);
      
      if (event.error?.name === 'ChunkLoadError' || event.message?.includes('Failed to fetch')) {
        toast({
          title: "Navigation Error",
          description: "There was a problem loading the page. Please try refreshing.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? (
            <Index />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={session ? "/" : "/login"} replace />
        }
      />
    </Routes>
  );
};

const ProtectedRoutes = ({ session }: ProtectedRoutesProps) => {
  return <AuthWrapper session={session} />;
};

export default ProtectedRoutes;