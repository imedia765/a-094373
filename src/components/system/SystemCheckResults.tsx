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

  // Group checks by check_type
  const groupedChecks = checks.reduce((acc: { [key: string]: SystemCheck[] }, check) => {
    if (!acc[check.check_type]) {
      acc[check.check_type] = [];
    }
    acc[check.check_type].push(check);
    return acc;
  }, {});

  const formatDetails = (checkType: string, details: any) => {
    // Handle collector role issues
    if (checkType === 'Collectors Without Role' && Array.isArray(details)) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collector Name</TableHead>
              <TableHead>Member Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.collector_name}</TableCell>
                <TableCell>{item.member_number || 'Not Assigned'}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm">
                    Warning
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    // Handle multiple roles
    if (checkType === 'Multiple Roles Assigned') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(details) ? details.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.user_id}</TableCell>
                <TableCell>{Array.isArray(item.roles) ? item.roles.join(', ') : item.roles}</TableCell>
                <TableCell>
                  {Array.isArray(item.created_at) 
                    ? item.created_at.map((date: string) => 
                        new Date(date).toLocaleDateString()
                      ).join(', ')
                    : new Date(item.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell className="font-medium">{details.user_id}</TableCell>
                <TableCell>{Array.isArray(details.roles) ? details.roles.join(', ') : details.roles}</TableCell>
                <TableCell>
                  {Array.isArray(details.created_at) 
                    ? details.created_at.map((date: string) => 
                        new Date(date).toLocaleDateString()
                      ).join(', ')
                    : new Date(details.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
      {Object.entries(groupedChecks).map(([checkType, checksOfType], index) => (
        <Card 
          key={index}
          className={`border ${getStatusColor(checksOfType[0].status)} bg-dashboard-card/50`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(checksOfType[0].status)}
              <CardTitle className="text-lg">
                {checkType}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(checksOfType[0].status)}`}>
                  {checksOfType[0].status}
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-sm space-y-2">
              {formatDetails(checkType, checksOfType.length === 1 ? checksOfType[0].details : checksOfType.map(c => c.details))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemCheckResults;