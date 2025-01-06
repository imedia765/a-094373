import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface SystemCheck {
  check_type: string;
  status: string;
  details: any;
}

interface SystemCheckResultsProps {
  checks: SystemCheck[];
}

const SystemCheckResults = ({ checks }: SystemCheckResultsProps) => {
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
    <div className="space-y-4">
      {checks.map((check, index) => (
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
  );
};

export default SystemCheckResults;