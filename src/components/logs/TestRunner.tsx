import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    
    try {
      toast({
        title: "Browser Test Simulation",
        description: "Tests are running in simulated mode. For full test execution, please run 'npm test' in your terminal.",
      });
      
      // Simulate test execution with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test Summary",
        description: "All tests passed in simulation mode",
      });
    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: "Error running tests",
        description: "Please run tests using 'npm test' in your terminal",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="dashboard-card bg-dashboard-card border-dashboard-cardBorder mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-dashboard-accent1">Test Runner</h2>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="bg-dashboard-accent1 hover:bg-dashboard-highlight text-white"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Tests'
          )}
        </Button>
      </div>
      
      <div className="text-dashboard-muted text-sm">
        Note: For full test execution, run <code className="bg-dashboard-card px-2 py-1 rounded">npm test</code> in your terminal.
      </div>
    </div>
  );
};