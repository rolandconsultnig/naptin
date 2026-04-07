import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  Server, 
  Cloud, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  Activity,
  HardDrive,
  Wifi,
  WifiOff
} from "lucide-react";

interface DatabaseStatus {
  primary: {
    url: string;
    connected: boolean;
  };
  secondary: {
    url: string;
    connected: boolean;
  };
}

interface SyncResult {
  table: string;
  success: boolean;
  count?: number;
  error?: string;
}

export default function DatabaseManagement() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/database/status', 'GET');
      setStatus(response);
    } catch (error) {
      console.error('Error fetching database status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch database status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnections = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/database/test-connections', 'POST');
      await fetchStatus(); // Refresh status after test
      toast({
        title: "Connection Test Complete",
        description: `Primary: ${response.primary ? 'Connected' : 'Failed'}, Secondary: ${response.secondary ? 'Connected' : 'Failed'}`,
        variant: response.primary && response.secondary ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing connections:', error);
      toast({
        title: "Error",
        description: "Failed to test database connections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncAllData = async () => {
    try {
      setIsSyncing(true);
      setSyncResults([]);
      const response = await apiRequest('/api/database/sync-all', 'POST');
      setSyncResults(response.results);
      toast({
        title: "Sync Complete",
        description: response.message,
        variant: "default",
      });
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncTable = async (table: string) => {
    try {
      setIsSyncing(true);
      const response = await apiRequest(`/api/database/sync/${table}`, 'POST');
      setSyncResults([{ table, ...response }]);
      toast({
        title: "Sync Complete",
        description: `Synced ${table}: ${response.count} records`,
        variant: response.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error syncing table:', error);
      toast({
        title: "Error",
        description: `Failed to sync ${table}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (connected: boolean) => {
    return connected ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Wifi className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    ) : (
      <Badge variant="destructive">
        <WifiOff className="h-3 w-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Database Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage your dual database setup
          </p>
        </div>
        <Button onClick={fetchStatus} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Database */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-blue-500" />
                <CardTitle>Primary Database (Local)</CardTitle>
              </div>
              {status && getStatusIcon(status.primary.connected)}
            </div>
            <CardDescription>
              Local PostgreSQL database for development and primary operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                {status && getStatusBadge(status.primary.connected)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <span className="text-sm font-mono text-gray-800">
                  {status?.primary.url || 'Loading...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Database */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-purple-500" />
                <CardTitle>Secondary Database (Neon)</CardTitle>
              </div>
              {status && getStatusIcon(status.secondary.connected)}
            </div>
            <CardDescription>
              Cloud-based Neon database for backup and secondary operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                {status && getStatusBadge(status.secondary.connected)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <span className="text-sm font-mono text-gray-800">
                  {status?.secondary.url || 'Loading...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            Database Operations
          </CardTitle>
          <CardDescription>
            Test connections and synchronize data between databases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={testConnections} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Test Connections
            </Button>
            
            <Button 
              onClick={syncAllData} 
              disabled={isSyncing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Sync All Data
            </Button>

            <div className="flex gap-2">
              {['users', 'assets', 'workOrders', 'maintenanceSchedules', 'inventory'].map((table) => (
                <Button
                  key={table}
                  onClick={() => syncTable(table)}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                >
                  Sync {table}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <span className="font-medium capitalize">{result.table}</span>
                      {result.count !== undefined && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({result.count} records)
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status Summary */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {status.primary.connected ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-600">Primary Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {status.secondary.connected ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-600">Secondary Connected</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="text-center">
              <div className="text-lg font-semibold">
                {status.primary.connected && status.secondary.connected 
                  ? 'All Systems Operational' 
                  : 'Some Connections Failed'
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {status.primary.connected && status.secondary.connected 
                  ? 'Both databases are connected and ready' 
                  : 'Check your database connections'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 