import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const TestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const testModules = import.meta.glob('../../__tests__/**/*.test.{ts,tsx}');
      const results: string[] = [];
      
      for (const path in testModules) {
        try {
          results.push(`Running tests in ${path}...`);
          await testModules[path]();
          results.push(`✅ Tests passed in ${path}`);
        } catch (error) {
          results.push(`❌ Tests failed in ${path}: ${error}`);
        }
      }
      
      setTestResults(results);
      toast({
        title: "Tests completed",
        description: "Check the results below",
      });
    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: "Error running tests",
        description: "Check the console for details",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="dashboard-card bg-dashboard-card border-dashboard-cardBorder">
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
      
      <ScrollArea className="h-[200px] rounded-md border border-dashboard-cardBorder p-4 bg-dashboard-dark">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className={`mb-2 font-mono text-sm ${
              result.includes('✅') ? 'text-dashboard-accent3' : 
              result.includes('❌') ? 'text-dashboard-error' : 
              'text-dashboard-text'
            }`}
          >
            {result}
          </div>
        ))}
        {testResults.length === 0 && (
          <div className="text-dashboard-muted italic">
            No test results yet. Click "Run Tests" to start testing.
          </div>
        )}
      </ScrollArea>
    </div>
  );
};