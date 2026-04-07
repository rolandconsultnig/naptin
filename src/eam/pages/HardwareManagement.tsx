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
  Camera, 
  QrCode, 
  Radio, 
  Wifi, 
  Bluetooth, 
  Usb, 
  Settings, 
  Power, 
  Battery, 
  Signal, 
  Scan, 
  Zap,
  Shield,
  Activity,
  HardDrive,
  Monitor,
  Printer,
  Thermometer,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Copy
} from "lucide-react";

interface HardwareDevice {
  id: string;
  name: string;
  type: 'barcode-scanner' | 'camera' | 'rfid-reader' | 'rfid-writer' | 'sensor' | 'printer' | 'display' | 'gateway';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  connection: 'usb' | 'bluetooth' | 'wifi' | 'ethernet' | 'serial';
  location: string;
  lastSeen: Date;
  battery?: number;
  signal?: number;
  temperature?: number;
  firmware?: string;
  serialNumber: string;
  ipAddress?: string;
  port?: number;
  configuration: Record<string, any>;
}

const mockDevices: HardwareDevice[] = [
  {
    id: "1",
    name: "Zebra DS2208 Barcode Scanner",
    type: "barcode-scanner",
    status: "online",
    connection: "usb",
    location: "Warehouse A - Receiving",
    lastSeen: new Date(),
    serialNumber: "ZB-DS2208-001",
    configuration: {
      scanMode: "manual",
      beepVolume: "high",
      ledBrightness: "medium",
      prefix: "",
      suffix: "\r\n"
    }
  },
  {
    id: "2",
    name: "Hikvision IP Camera",
    type: "camera",
    status: "online",
    connection: "ethernet",
    location: "Main Gate",
    lastSeen: new Date(),
    ipAddress: "192.168.1.100",
    port: 554,
    serialNumber: "HK-IPC-002",
    configuration: {
      resolution: "1920x1080",
      fps: 30,
      recording: true,
      motionDetection: true,
      nightVision: true
    }
  },
  {
    id: "3",
    name: "ZEBRA ZT411 RFID Printer",
    type: "printer",
    status: "online",
    connection: "ethernet",
    location: "Labeling Station",
    lastSeen: new Date(),
    ipAddress: "192.168.1.101",
    port: 9100,
    serialNumber: "ZB-ZT411-003",
    configuration: {
      printResolution: "203dpi",
      printSpeed: "6ips",
      labelSize: "4x6",
      ribbonType: "wax"
    }
  },
  {
    id: "4",
    name: "Alien ALR-F800 RFID Reader",
    type: "rfid-reader",
    status: "online",
    connection: "ethernet",
    location: "Loading Dock",
    lastSeen: new Date(),
    ipAddress: "192.168.1.102",
    port: 5084,
    signal: 85,
    serialNumber: "AL-ALR-F800-004",
    configuration: {
      readPower: "30dBm",
      readMode: "continuous",
      antennaPorts: [1, 2, 3, 4],
      filterMode: "none"
    }
  },
  {
    id: "5",
    name: "ZEBRA ZT411 RFID Writer",
    type: "rfid-writer",
    status: "maintenance",
    connection: "usb",
    location: "Encoding Station",
    lastSeen: new Date(Date.now() - 3600000),
    serialNumber: "ZB-ZT411-005",
    configuration: {
      writePower: "25dBm",
      encodingFormat: "EPC96",
      writeMode: "single",
      verifyWrite: true
    }
  },
  {
    id: "6",
    name: "Temperature Sensor Array",
    type: "sensor",
    status: "online",
    connection: "wifi",
    location: "Cold Storage",
    lastSeen: new Date(),
    temperature: -18.5,
    battery: 92,
    serialNumber: "TS-ARRAY-006",
    configuration: {
      samplingInterval: "30s",
      alertThreshold: {
        min: -25,
        max: -10
      },
      calibrationOffset: 0.2
    }
  },
  {
    id: "7",
    name: "Industrial Gateway",
    type: "gateway",
    status: "online",
    connection: "ethernet",
    location: "Control Room",
    lastSeen: new Date(),
    ipAddress: "192.168.1.1",
    port: 8080,
    serialNumber: "IG-MAIN-007",
    configuration: {
      protocol: "Modbus TCP",
      pollingInterval: "1s",
      maxConnections: 50,
      securityLevel: "high"
    }
  },
  {
    id: "8",
    name: "Touch Display Terminal",
    type: "display",
    status: "error",
    connection: "ethernet",
    location: "Operator Station",
    lastSeen: new Date(Date.now() - 1800000),
    ipAddress: "192.168.1.103",
    port: 80,
    serialNumber: "TD-TERM-008",
    configuration: {
      screenResolution: "1920x1080",
      touchSensitivity: "high",
      brightness: 80,
      timeout: "5min"
    }
  }
];

export default function HardwareManagement() {
  const [devices, setDevices] = useState<HardwareDevice[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<HardwareDevice | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [rfidData, setRfidData] = useState<string[]>([]);

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
      case 'barcode-scanner': return <Scan className="h-5 w-5" />;
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'rfid-reader': return <Radio className="h-5 w-5" />;
      case 'rfid-writer': return <Radio className="h-5 w-5" />;
      case 'sensor': return <Thermometer className="h-5 w-5" />;
      case 'printer': return <Printer className="h-5 w-5" />;
      case 'display': return <Monitor className="h-5 w-5" />;
      case 'gateway': return <Wifi className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb': return <Usb className="h-4 w-4" />;
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />;
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'ethernet': return <HardDrive className="h-4 w-4" />;
      case 'serial': return <Activity className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const startBarcodeScanning = () => {
    setScanning(true);
    // Simulate barcode scanning
    setTimeout(() => {
      const mockBarcodes = [
        "AT001-PS001",
        "AT002-CU002", 
        "AT003-VA003",
        "AT004-TK004",
        "AT005-PL005"
      ];
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      setScannedData(prev => [...prev, `${new Date().toLocaleTimeString()}: ${randomBarcode}`]);
      setScanning(false);
    }, 2000);
  };

  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      setCameraStream(stream);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const simulateRFIDRead = () => {
    const mockRFIDTags = [
      "E200 3411 B802 0111 2222 3333",
      "E200 3411 B802 0111 2222 4444",
      "E200 3411 B802 0111 2222 5555"
    ];
    const randomTag = mockRFIDTags[Math.floor(Math.random() * mockRFIDTags.length)];
    setRfidData(prev => [...prev, `${new Date().toLocaleTimeString()}: ${randomTag}`]);
  };

  const toggleDeviceStatus = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: device.status === 'online' ? 'offline' : 'online' }
        : device
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Hardware Management</h1>
        <p className="text-muted-foreground">
          Monitor and control industrial hardware devices including scanners, cameras, RFID equipment, and sensors.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Device Overview</TabsTrigger>
          <TabsTrigger value="scanners">Barcode Scanners</TabsTrigger>
          <TabsTrigger value="cameras">Cameras</TabsTrigger>
          <TabsTrigger value="rfid">RFID Equipment</TabsTrigger>
          <TabsTrigger value="sensors">Sensors & IoT</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((devices.filter(d => d.status === 'online').length / devices.length) * 100).toFixed(1)}% uptime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devices in Error</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {devices.filter(d => d.status === 'error').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {devices.filter(d => d.status === 'maintenance').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled maintenance
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <Card key={device.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedDevice(device)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(device.type)}
                          <CardTitle className="text-sm">{device.name}</CardTitle>
                        </div>
                        {getStatusIcon(device.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                            {device.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{device.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Connection:</span>
                          <div className="flex items-center space-x-1">
                            {getConnectionIcon(device.connection)}
                            <span className="capitalize">{device.connection}</span>
                          </div>
                        </div>
                        {device.battery && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Battery:</span>
                              <span>{device.battery}%</span>
                            </div>
                            <Progress value={device.battery} className="h-2" />
                          </div>
                        )}
                        {device.temperature && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Temperature:</span>
                            <span>{device.temperature}°C</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Barcode Scanner Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Scanner Status</Label>
                    <Switch 
                      checked={scanning} 
                      onCheckedChange={setScanning}
                      disabled={scanning}
                    />
                  </div>
                  
                  <Button 
                    onClick={startBarcodeScanning} 
                    disabled={scanning}
                    className="w-full"
                  >
                    {scanning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Start Scanning
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    <Label>Scanner Configuration</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select defaultValue="manual">
                        <SelectTrigger>
                          <SelectValue placeholder="Scan Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="continuous">Continuous</SelectItem>
                          <SelectItem value="motion">Motion</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="high">
                        <SelectTrigger>
                          <SelectValue placeholder="Beep Volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Scanned Data</Label>
                  <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/50">
                    {scannedData.length === 0 ? (
                      <p className="text-muted-foreground text-center">No scanned data yet</p>
                    ) : (
                      <div className="space-y-2">
                        {scannedData.map((data, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="font-mono text-sm">{data}</span>
                            <Button variant="ghost" size="sm">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {scannedData.length > 0 && (
                    <Button variant="outline" onClick={() => setScannedData([])}>
                      Clear Data
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Camera Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Camera Stream</Label>
                    <div className="flex gap-2">
                      <Button onClick={startCameraStream} disabled={!!cameraStream}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Stream
                      </Button>
                      <Button onClick={stopCameraStream} disabled={!cameraStream} variant="outline">
                        Stop Stream
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Camera Settings</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select defaultValue="1920x1080">
                        <SelectTrigger>
                          <SelectValue placeholder="Resolution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="640x480">640x480</SelectItem>
                          <SelectItem value="1280x720">1280x720</SelectItem>
                          <SelectItem value="1920x1080">1920x1080</SelectItem>
                          <SelectItem value="3840x2160">4K</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="FPS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 FPS</SelectItem>
                          <SelectItem value="30">30 FPS</SelectItem>
                          <SelectItem value="60">60 FPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Recording Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="motion-detection" defaultChecked />
                        <Label htmlFor="motion-detection">Motion Detection</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="night-vision" defaultChecked />
                        <Label htmlFor="night-vision">Night Vision</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="recording" defaultChecked />
                        <Label htmlFor="recording">Continuous Recording</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Live Feed</Label>
                  <div className="border rounded-lg p-4 h-64 bg-muted/50 flex items-center justify-center">
                    {cameraStream ? (
                      <video 
                        autoPlay 
                        playsInline 
                        className="max-w-full max-h-full rounded"
                        ref={(video) => {
                          if (video) video.srcObject = cameraStream;
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No active camera stream</p>
                        <p className="text-sm">Click "Start Stream" to begin</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfid" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  RFID Reader
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Reader Status</Label>
                  <Badge variant="default">Active</Badge>
                </div>

                <Button onClick={simulateRFIDRead} className="w-full">
                  <Radio className="h-4 w-4 mr-2" />
                  Simulate RFID Read
                </Button>

                <div className="space-y-2">
                  <Label>Reader Configuration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue placeholder="Read Power" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 dBm</SelectItem>
                        <SelectItem value="25">25 dBm</SelectItem>
                        <SelectItem value="30">30 dBm</SelectItem>
                        <SelectItem value="35">35 dBm</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select defaultValue="continuous">
                      <SelectTrigger>
                        <SelectValue placeholder="Read Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="continuous">Continuous</SelectItem>
                        <SelectItem value="burst">Burst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Antenna Configuration</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(antenna => (
                      <div key={antenna} className="flex items-center space-x-2">
                        <Switch id={`antenna-${antenna}`} defaultChecked={antenna <= 2} />
                        <Label htmlFor={`antenna-${antenna}`} className="text-sm">A{antenna}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  RFID Writer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Writer Status</Label>
                  <Badge variant="secondary">Maintenance</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Write Configuration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select defaultValue="25">
                      <SelectTrigger>
                        <SelectValue placeholder="Write Power" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 dBm</SelectItem>
                        <SelectItem value="25">25 dBm</SelectItem>
                        <SelectItem value="30">30 dBm</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select defaultValue="EPC96">
                      <SelectTrigger>
                        <SelectValue placeholder="Encoding Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EPC96">EPC-96</SelectItem>
                        <SelectItem value="EPC128">EPC-128</SelectItem>
                        <SelectItem value="TID">TID</SelectItem>
                        <SelectItem value="USER">USER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Write Data</Label>
                  <Input placeholder="Enter data to write to RFID tag" />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Radio className="h-4 w-4 mr-2" />
                      Write Tag
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Shield className="h-4 w-4 mr-2" />
                      Lock Tag
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Write Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="verify-write" defaultChecked />
                      <Label htmlFor="verify-write">Verify Write</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="lock-after-write" />
                      <Label htmlFor="lock-after-write">Lock After Write</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>RFID Data Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/50">
                {rfidData.length === 0 ? (
                  <p className="text-muted-foreground text-center">No RFID data yet</p>
                ) : (
                  <div className="space-y-2">
                    {rfidData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="font-mono text-sm">{data}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {rfidData.length > 0 && (
                <Button variant="outline" onClick={() => setRfidData([])} className="mt-2">
                  Clear Log
                </Button>
              )}
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
                        {sensor.temperature && (
                          <div className="text-center">
                            <div className="text-2xl font-bold">{sensor.temperature}°C</div>
                            <div className="text-sm text-muted-foreground">Temperature</div>
                          </div>
                        )}
                        
                        {sensor.battery && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Battery</span>
                              <span>{sensor.battery}%</span>
                            </div>
                            <Progress value={sensor.battery} className="h-2" />
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Last updated: {sensor.lastSeen.toLocaleTimeString()}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Activity className="h-3 w-3 mr-1" />
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
      </Tabs>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Connection</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getConnectionIcon(selectedDevice.connection)}
                    <span className="capitalize">{selectedDevice.connection}</span>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="mt-1">{selectedDevice.location}</p>
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <p className="mt-1 font-mono text-sm">{selectedDevice.serialNumber}</p>
                </div>
                {selectedDevice.ipAddress && (
                  <div>
                    <Label>IP Address</Label>
                    <p className="mt-1 font-mono text-sm">{selectedDevice.ipAddress}</p>
                  </div>
                )}
                {selectedDevice.port && (
                  <div>
                    <Label>Port</Label>
                    <p className="mt-1">{selectedDevice.port}</p>
                  </div>
                )}
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