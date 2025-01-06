import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    // Handle collector role issues
    if (Array.isArray(details) && details.length > 0 && details[0].collector_name) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collector Name</TableHead>
              <TableHead>Member Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.collector_name}</TableCell>
                <TableCell>{item.member_number || 'Not Assigned'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    // Handle multiple roles
    if (details.roles && Array.isArray(details.roles)) {
      return (
        <div className="space-y-2">
          <div>
            <span className="font-medium text-dashboard-accent1">Roles:</span>{' '}
            <span className="text-dashboard-text">{details.roles.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-dashboard-accent1">User ID:</span>{' '}
            <span className="text-dashboard-text">{details.user_id}</span>
          </div>
          <div>
            <span className="font-medium text-dashboard-accent1">Created:</span>{' '}
            <span className="text-dashboard-text">
              {Array.isArray(details.created_at) 
                ? details.created_at.map((date: string) => 
                    new Date(date).toLocaleDateString()
                  ).join(', ')
                : new Date(details.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      );
    }

    // Default formatting for other types of details
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