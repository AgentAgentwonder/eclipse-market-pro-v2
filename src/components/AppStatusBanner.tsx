import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, WifiOff } from 'lucide-react';
import { useAppErrors, useAllStatuses } from '@/store/appStatusStore';

export function AppStatusBanner() {
  const appErrors = useAppErrors();
  const allStatuses = useAllStatuses();

  const connectionIssues = allStatuses.filter(
    s => s.connectionState === 'disconnected' || s.connectionState === 'error'
  );

  if (appErrors.length === 0 && connectionIssues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {appErrors.map(error => (
        <Alert key={`${error.domain}-${error.timestamp}`} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="capitalize">{error.domain} Error</AlertTitle>
          <AlertDescription>
            {error.message}
            <span className="text-xs block mt-1 opacity-70">
              {new Date(error.timestamp).toLocaleTimeString()}
            </span>
          </AlertDescription>
        </Alert>
      ))}

      {connectionIssues.length > 0 && (
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
          <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-600 dark:text-yellow-400">Connection Issues</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              {connectionIssues.map(status => (
                <div key={status.domain} className="text-sm text-foreground/80">
                  <span className="font-medium capitalize">{status.domain}</span>
                  {status.provider && ` (${status.provider})`}: {status.connectionState}
                  {status.errorMessage && ` - ${status.errorMessage}`}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
