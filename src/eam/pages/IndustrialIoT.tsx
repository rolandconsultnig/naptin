import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Button } from "@eam/components/ui/button";
import { Badge } from "@eam/components/ui/badge";
import { Input } from "@eam/components/ui/input";
import { Label } from "@eam/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eam/components/ui/select";
import { Switch } from "@eam/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eam/components/ui/tabs";
import { Separator } from "@eam/components/ui/separator";
import { Progress } from "@eam/components/ui/progress";
import { 
  Cpu, 
  Database, 
  Network, 
  Server, 
  Activity, 
  Zap, 
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Power,
  Settings,
  Monitor,
  HardDrive,
  Wifi,
  Bluetooth,
  Usb
} from "lucide-react";

interface IoTDevice {
  id: string;
  name: string;
  type: 'plc' | 'scada' | 'gateway' | 'hmi' | 'sensor' | 'actuator' | 'server';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  protocol: 'modbus' | 'opc-ua' | 'ethernet-ip' | 'profinet' | 'mqtt' | 'http';
  location: string;
  lastSeen: Date;
  ipAddress: string;
  port: number;
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  networkLatency: number;
  dataPoints: Array<{
    timestamp: Date;
    value: number;
    unit: string;
  }>;
  configuration: Record<string, any>;
}

const mockIoTDevices: IoTDevice[] = [
  {
    id: "1",
    name: "Siemens S7-1200 PLC",
    type: "plc",
    status: "online",
    protocol: "profinet",
    location: "Production Line A",
    lastSeen: new Date(),
    ipAddress: "192.168.1.10",
    port: 102,
    cpuUsage: 45,
    memoryUsage: 62,
    temperature: 42,
    networkLatency: 12,
    dataPoints: [
      { timestamp: new Date(Date.now() - 60000), value: 25.5, unit: "°C" },
      { timestamp: new Date(Date.now() - 30000), value: 26.1, unit: "°C" },
      { timestamp: new Date(), value: 25.8, unit: "°C" }
    ],
    configuration: {
      scanTime: "100ms",
      ioConfiguration: {
        digitalInputs: 14,
        digitalOutputs: 10,
        analogInputs: 2,
        analogOutputs: 2
      },
      communicationSettings: {
        baudRate: 9600,
        parity: "none",
        stopBits: 1
      }
    }
  },
  {
    id: "2",
    name: "Wonderware SCADA Server",
    type: "scada",
    status: "online",
    protocol: "opc-ua",
    location: "Control Room",
    lastSeen: new Date(),
    ipAddress: "192.168.1.20",
    port: 4840,
    cpuUsage: 78,
    memoryUsage: 85,
    temperature: 58,
    networkLatency: 8,
    dataPoints: [
      { timestamp: new Date(Date.now() - 60000), value: 1200, unit: "rpm" },
      { timestamp: new Date(Date.now() - 30000), value: 1180, unit: "rpm" },
      { timestamp: new Date(), value: 1220, unit: "rpm" }
    ],
    configuration: {
      databaseType: "SQL Server",
      historianEnabled: true,
      alarmSystem: {
        enabled: true,
        escalationLevels: 3,
        notificationEmail: "operator@company.com"
      },
      securitySettings: {
        authentication: "Windows",
        encryption: "AES-256",
        firewallEnabled: true
      }
    }
  },
  {
    id: "3",
    name: "Industrial Gateway",
    type: "gateway",
    status: "online",
    protocol: "mqtt",
    location: "Network Hub",
    lastSeen: new Date(),
    ipAddress: "192.168.1.30",
    port: 1883,
    cpuUsage: 23,
    memoryUsage: 41,
    temperature: 35,
    networkLatency: 5,
    dataPoints: [
      { timestamp: new Date(Date.now() - 60000), value: 15.2, unit: "bar" },
      { timestamp: new Date(Date.now() - 30000), value: 15.5, unit: "bar" },
      { timestamp: new Date(), value: 15.3, unit: "bar" }
    ],
    configuration: {
      protocolConversion: {
        from: "modbus",
        to: "mqtt",
        mappingEnabled: true
      },
      dataBuffering: {
        enabled: true,
        bufferSize: "1MB",
        flushInterval: "5s"
      },
      security: {
        sslEnabled: true,
        certificateValid: true,
        accessControl: "whitelist"
      }
    }
  },
  {
    id: "4",
    name: "HMI Touch Panel",
    type: "hmi",
    status: "online",
    protocol: "ethernet-ip",
    location: "Operator Station",
    lastSeen: new Date(),
    ipAddress: "192.168.1.40",
    port: 44818,
    cpuUsage: 34,
    memoryUsage: 28,
    temperature: 38,
    networkLatency: 15,
    dataPoints: [
      { timestamp: new Date(Date.now() - 60000), value: 85, unit: "%" },
      { timestamp: new Date(Date.now() - 30000), value: 87, unit: "%" },
      { timestamp: new Date(), value: 86, unit: "%" }
    ],
    configuration: {
      screenResolution: "1024x768",
      touchCalibration: "calibrated",
      userLevels: ["operator", "supervisor", "engineer"],
      alarmDisplay: {
        enabled: true,
        maxAlarms: 50,
        autoAcknowledge: false
      }
    }
  },
  {
    id: "5",
    name: "Pressure Sensor Array",
    type: "sensor",
    status: "error",
    protocol: "modbus",
    location: "Pipeline Junction",
    lastSeen: new Date(Date.now() - 300000),
    ipAddress: "192.168.1.50",
    port: 502,
    cpuUsage: 12,
    memoryUsage: 18,
    temperature: 45,
    networkLatency: 45,
    dataPoints: [
      { timestamp: new Date(Date.now() - 60000), value: 0, unit: "bar" },
      { timestamp: new Date(Date.now() - 30000), value: 0, unit: "bar" },
      { timestamp: new Date(), value: 0, unit: "bar" }
    ],
    configuration: {
      measurementRange: "0-20 bar",
      accuracy: "±0.1%",
      calibrationDate: "2024-01-15",
      maintenanceDue: "2024-07-15",
      alarmThresholds: {
        low: 2.0,
        high: 18.0,
        critical: 19.5
      }
    }
  },
  {
    id: "6",
    name: "Control Valve Actuator",
    type: "actuator",
    status: "maintenance",
    protocol: "profinet",
    location: "Flow Control Station",
    lastSeen: new Date(Date.now() - 600000),
    ipAddress: "192.168.1.60",
    port: 102,
    cpuUsage: 8,
    memoryUsage: 15,
    temperature: 52,
    networkLatency: 28,
    dataPoints: [
      { timestamp: new Date(Date.now() - 60000), value: 65, unit: "%" },
      { timestamp: new Date(Date.now() - 30000), value: 65, unit: "%" },
      { timestamp: new Date(), value: 65, unit: "%" }
    ],
    configuration: {
      valveType: "ball valve",
      actuatorType: "electric",
      positionRange: "0-100%",
      responseTime: "2s",
      failSafe: "fail-closed",
      maintenanceSchedule: "monthly"
    }
  }
];

export default function IndustrialIoT() {
  const [devices, setDevices] = useState<IoTDevice[]>(mockIoTDevices);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [realTimeData, setRealTimeData] = useState<Record<string, number>>({});
  const [alarms, setAlarms] = useState<Array<{
    id: string;
    deviceId: string;
    deviceName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  }>>([]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        cpuUsage: Math.max(5, Math.min(95, device.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(10, Math.min(90, device.memoryUsage + (Math.random() - 0.5) * 5)),
        temperature: Math.max(20, Math.min(80, device.temperature + (Math.random() - 0.5) * 3)),
        networkLatency: Math.max(1, Math.min(100, device.networkLatency + (Math.random() - 0.5) * 5)),
        lastSeen: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'plc': return <Cpu className="h-5 w-5" />;
      case 'scada': return <Server className="h-5 w-5" />;
      case 'gateway': return <Network className="h-5 w-5" />;
      case 'hmi': return <Monitor className="h-5 w-5" />;
      case 'sensor': return <Thermometer className="h-5 w-5" />;
      case 'actuator': return <Zap className="h-5 w-5" />;
      case 'server': return <Database className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'modbus': return <Activity className="h-4 w-4" />;
      case 'opc-ua': return <Network className="h-4 w-4" />;
      case 'ethernet-ip': return <Wifi className="h-4 w-4" />;
      case 'profinet': return <HardDrive className="h-4 w-4" />;
      case 'mqtt': return <Bluetooth className="h-4 w-4" />;
      case 'http': return <Usb className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const toggleDeviceStatus = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: device.status === 'online' ? 'offline' : 'online' }
        : device
    ));
  };

  const acknowledgeAlarm = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Industrial IoT Management</h1>
        <p className="text-muted-foreground">
          Monitor and control industrial automation systems, PLCs, SCADA, and IoT devices.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="plcs">PLCs</TabsTrigger>
          <TabsTrigger value="scada">SCADA</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="alarms">Alarms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{devices.length}</div>
                <p className="text-xs text-muted-foreground">
                  {devices.filter(d => d.status === 'online').length} online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((devices.filter(d => d.status === 'online').length / devices.length) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Operational uptime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alarms</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {alarms.filter(a => !a.acknowledged).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unacknowledged
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(devices.reduce((sum, d) => sum + d.networkLatency, 0) / devices.length).toFixed(1)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device.type)}
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">{device.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                          {device.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedDevice(device)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Average CPU Usage</Label>
                      <span className="text-sm font-medium">
                        {(devices.reduce((sum, d) => sum + d.cpuUsage, 0) / devices.length).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={devices.reduce((sum, d) => sum + d.cpuUsage, 0) / devices.length} 
                      className="h-2" 
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Average Memory Usage</Label>
                      <span className="text-sm font-medium">
                        {(devices.reduce((sum, d) => sum + d.memoryUsage, 0) / devices.length).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={devices.reduce((sum, d) => sum + d.memoryUsage, 0) / devices.length} 
                      className="h-2" 
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Average Temperature</Label>
                      <span className="text-sm font-medium">
                        {(devices.reduce((sum, d) => sum + d.temperature, 0) / devices.length).toFixed(1)}°C
                      </span>
                    </div>
                    <Progress 
                      value={(devices.reduce((sum, d) => sum + d.temperature, 0) / devices.length) / 100 * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plcs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                PLC Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.filter(d => d.type === 'plc').map((plc) => (
                  <Card key={plc.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-5 w-5" />
                          <CardTitle className="text-sm">{plc.name}</CardTitle>
                        </div>
                        {getStatusIcon(plc.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">CPU:</span>
                            <div className="font-medium">{plc.cpuUsage}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory:</span>
                            <div className="font-medium">{plc.memoryUsage}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Temp:</span>
                            <div className="font-medium">{plc.temperature}°C</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Latency:</span>
                            <div className="font-medium">{plc.networkLatency}ms</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Protocol:</span>
                            <div className="flex items-center space-x-1">
                              {getProtocolIcon(plc.protocol)}
                              <span className="uppercase">{plc.protocol}</span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">IP:</span>
                            <span className="font-mono ml-1">{plc.ipAddress}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Monitor className="h-3 w-3 mr-1" />
                            Monitor
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scada" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                SCADA System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {devices.filter(d => d.type === 'scada').map((scada) => (
                  <Card key={scada.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="h-5 w-5" />
                          <CardTitle>{scada.name}</CardTitle>
                        </div>
                        {getStatusIcon(scada.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>CPU Usage</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={scada.cpuUsage} className="flex-1" />
                            <span className="text-sm font-medium">{scada.cpuUsage}%</span>
                          </div>
                        </div>
                        <div>
                          <Label>Memory Usage</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={scada.memoryUsage} className="flex-1" />
                            <span className="text-sm font-medium">{scada.memoryUsage}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>System Information</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Database:</span>
                            <div>{scada.configuration.databaseType}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Historian:</span>
                            <div>{scada.configuration.historianEnabled ? 'Enabled' : 'Disabled'}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IP Address:</span>
                            <div className="font-mono">{scada.ipAddress}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Protocol:</span>
                            <div className="uppercase">{scada.protocol}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Monitor className="h-4 w-4 mr-2" />
                          Open SCADA
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Sensor Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.filter(d => d.type === 'sensor').map((sensor) => (
                  <Card key={sensor.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-5 w-5" />
                          <CardTitle className="text-sm">{sensor.name}</CardTitle>
                        </div>
                        {getStatusIcon(sensor.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {sensor.dataPoints[sensor.dataPoints.length - 1]?.value || 0}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                              {sensor.dataPoints[sensor.dataPoints.length - 1]?.unit || ''}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">Current Reading</div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={sensor.status === 'online' ? 'default' : 'secondary'}>
                              {sensor.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span>{sensor.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Protocol:</span>
                            <div className="flex items-center space-x-1">
                              {getProtocolIcon(sensor.protocol)}
                              <span className="uppercase">{sensor.protocol}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Activity className="h-3 w-3 mr-1" />
                            Trends
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Calibrate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alarms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alarm Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alarms.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-muted-foreground">No active alarms</p>
                  </div>
                ) : (
                  alarms.map((alarm) => (
                    <div key={alarm.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          alarm.severity === 'critical' ? 'text-red-500' :
                          alarm.severity === 'high' ? 'text-orange-500' :
                          alarm.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <div className="font-medium">{alarm.deviceName}</div>
                          <div className="text-sm text-muted-foreground">{alarm.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {alarm.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          alarm.severity === 'critical' ? 'destructive' :
                          alarm.severity === 'high' ? 'default' :
                          alarm.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {alarm.severity}
                        </Badge>
                        {!alarm.acknowledged && (
                          <Button 
                            size="sm" 
                            onClick={() => acknowledgeAlarm(alarm.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getDeviceIcon(selectedDevice.type)}
                  {selectedDevice.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDevice(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedDevice.status)}
                    <Badge variant={selectedDevice.status === 'online' ? 'default' : 'secondary'}>
                      {selectedDevice.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Protocol</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getProtocolIcon(selectedDevice.protocol)}
                    <span className="uppercase">{selectedDevice.protocol}</span>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="mt-1">{selectedDevice.location}</p>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="mt-1 font-mono text-sm">{selectedDevice.ipAddress}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>CPU Usage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={selectedDevice.cpuUsage} className="flex-1" />
                    <span className="text-sm font-medium">{selectedDevice.cpuUsage}%</span>
                  </div>
                </div>
                <div>
                  <Label>Memory Usage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={selectedDevice.memoryUsage} className="flex-1" />
                    <span className="text-sm font-medium">{selectedDevice.memoryUsage}%</span>
                  </div>
                </div>
                <div>
                  <Label>Temperature</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedDevice.temperature}°C</span>
                  </div>
                </div>
                <div>
                  <Label>Network Latency</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Network className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedDevice.networkLatency}ms</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Configuration</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(selectedDevice.configuration, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => toggleDeviceStatus(selectedDevice.id)}
                  variant={selectedDevice.status === 'online' ? 'destructive' : 'default'}
                  className="flex-1"
                >
                  <Power className="h-4 w-4 mr-2" />
                  {selectedDevice.status === 'online' ? 'Power Off' : 'Power On'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 