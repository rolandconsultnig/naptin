import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Button } from "@eam/components/ui/button";
import { Input } from "@eam/components/ui/input";
import { Badge } from "@eam/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eam/components/ui/tabs";
import { MapPin, Search, Filter, Layers, Navigation, Box, Building, Zap, Droplets, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, Clock, Settings, Shield, Flame, Gauge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockAssets, mapPoints } from "@eam/lib/mockData";

// Fix for default markers in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Asset {
  id: number;
  name: string;
  assetId: string;
  type: string;
  location: string;
  status: string;
  criticality: string;
  latitude?: number;
  longitude?: number;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  department: string;
  cost: number;
  condition: string;
  locationDetails: string;
  specifications: Record<string, any>;
  maintenanceHistory: any[];
  documents: any[];
}

interface MapPoint {
  id: string;
  name: string;
  type: 'refinery' | 'infrastructure' | 'pipeline' | 'asset';
  latitude: number;
  longitude: number;
  status: string;
  description: string;
  capacity?: string;
  operator?: string;
}

// Enhanced custom icons for different asset types
const createCustomIcon = (color: string, size: number = 20) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${size * 0.4}px;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const refineryIcon = createCustomIcon('#3B82F6', 24); // Blue
const infrastructureIcon = createCustomIcon('#EC4899', 20); // Pink
const pipelineIcon = createCustomIcon('#000000', 18); // Black
const assetIcon = createCustomIcon('#10B981', 22); // Green
const criticalIcon = createCustomIcon('#EF4444', 26); // Red
const highIcon = createCustomIcon('#F97316', 24); // Orange
const mediumIcon = createCustomIcon('#EAB308', 22); // Yellow
const lowIcon = createCustomIcon('#22C55E', 20); // Green

export default function AssetMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedLayer, setSelectedLayer] = useState("all");
  const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  // Ensure component only renders on client side for Leaflet
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Trigger refetch of assets data
      window.location.reload();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    initialData: mockAssets, // Use mock data as fallback
  });

  // Pipeline coordinates for drawing lines
  const pipelineCoordinates = [
    // Port Harcourt to Kaduna
    [[4.8156, 7.0498], [10.5222, 7.4384]],
    // Warri to Kaduna
    [[5.5560, 5.7936], [10.5222, 7.4384]],
    // Lagos to Ibadan (approximate)
    [[6.5244, 3.3792], [7.3964, 3.8975]],
    // Kaduna to Kano
    [[10.5222, 7.4384], [11.9914, 8.5317]]
  ];

  const filteredAssets = (assets || []).filter((asset: Asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || asset.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Get assets that need attention
  const alertAssets = filteredAssets.filter(asset => 
    asset.status === 'down' || 
    asset.status === 'maintenance' || 
    asset.criticality === 'critical'
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "down":
        return "bg-red-100 text-red-800";
      case "idle":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIconForAsset = (asset: Asset) => {
    // First check criticality for icon size and color
    switch (asset.criticality.toLowerCase()) {
      case "critical":
        return criticalIcon;
      case "high":
        return highIcon;
      case "medium":
        return mediumIcon;
      case "low":
        return lowIcon;
      default:
        return assetIcon;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'refinery':
        return refineryIcon;
      case 'infrastructure':
        return infrastructureIcon;
      case 'pipeline':
        return pipelineIcon;
      default:
        return assetIcon;
    }
  };

  const allPoints = [...mapPoints.refineries, ...mapPoints.infrastructure, ...mapPoints.pipelines];
  const filteredPoints = allPoints.filter(point => {
    if (selectedLayer === "all") return true;
    return point.type === selectedLayer;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NNPC Asset Map</h1>
            <p className="text-gray-600 mt-1">
              Visualize NNPC refineries, infrastructure, and pipeline network across Nigeria
            </p>
          </div>
        </div>
        <Card className="min-h-[600px]">
          <CardContent className="p-0">
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-gray-500">Loading map...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NNPC Asset Map</h1>
          <p className="text-gray-600 mt-1">
            Visualize NNPC refineries, infrastructure, and pipeline network across Nigeria
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAlerts(!showAlerts)}
            className={showAlerts ? "bg-red-50 border-red-200" : ""}
          >
            {showAlerts ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showAlerts ? "Hide Alerts" : "Show Alerts"}
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      {showAlerts && alertAssets.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Assets Requiring Attention</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {alertAssets.slice(0, 6).map((asset) => (
                <div key={asset.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <div className={`w-3 h-3 rounded-full ${
                    asset.status === 'down' ? 'bg-red-500' : 
                    asset.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium">{asset.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {asset.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assets by name, ID, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="operational">Operational</option>
                <option value="maintenance">Maintenance</option>
                <option value="down">Down</option>
                <option value="idle">Idle</option>
              </select>
              <select
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Layers</option>
                <option value="refinery">Refineries</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="pipeline">Pipelines</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAssets.length}</p>
              </div>
              <Box className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operational</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAssets.filter(a => a.status === 'operational').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Assets</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAssets.filter(a => a.criticality === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredAssets.filter(a => a.status === 'maintenance').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map and Asset Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <MapContainer
                center={[8.0, 6.0]}
                zoom={6}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Pipeline Lines */}
                <LayerGroup>
                  {pipelineCoordinates.map((coords, index) => (
                    <Polyline
                      key={index}
                      positions={coords}
                      color="#000000"
                      weight={3}
                      opacity={0.7}
                    />
                  ))}
                </LayerGroup>

                {/* Infrastructure Points */}
                <LayerGroup>
                  {filteredPoints.map((point) => (
                    <Marker
                      key={point.id}
                      position={[point.latitude, point.longitude]}
                      icon={getIconForType(point.type)}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg">{point.name}</h3>
                          <p className="text-gray-600 text-sm">{point.description}</p>
                          <div className="mt-2">
                            <Badge className={getStatusColor(point.status)}>
                              {point.status}
                            </Badge>
                          </div>
                          {point.capacity && (
                            <p className="text-sm mt-1">
                              <strong>Capacity:</strong> {point.capacity}
                            </p>
                          )}
                          {point.operator && (
                            <p className="text-sm">
                              <strong>Operator:</strong> {point.operator}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>

                {/* Asset Markers */}
                <LayerGroup>
                  {filteredAssets.map((asset) => (
                    <Marker
                      key={asset.id}
                      position={[asset.latitude || 0, asset.longitude || 0]}
                      icon={getIconForAsset(asset)}
                      eventHandlers={{
                        click: () => setSelectedAsset(asset),
                        mouseover: () => setHoveredPoint({
                          id: asset.assetId,
                          name: asset.name,
                          type: 'asset',
                          latitude: asset.latitude || 0,
                          longitude: asset.longitude || 0,
                          status: asset.status,
                          description: asset.locationDetails
                        }),
                        mouseout: () => setHoveredPoint(null)
                      }}
                    >
                      <Tooltip>
                        <div className="p-2">
                          <h3 className="font-bold">{asset.name}</h3>
                          <p className="text-sm">{asset.assetId}</p>
                          <p className="text-sm">{asset.location}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                            <Badge className={getCriticalityColor(asset.criticality)}>
                              {asset.criticality}
                            </Badge>
                          </div>
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
                </LayerGroup>

                {/* Status Circles around assets */}
                <LayerGroup>
                  {filteredAssets.map((asset) => (
                    <CircleMarker
                      key={`circle-${asset.id}`}
                      center={[asset.latitude || 0, asset.longitude || 0]}
                      radius={8}
                      pathOptions={{
                        color: asset.status === 'operational' ? '#22C55E' : 
                               asset.status === 'maintenance' ? '#EAB308' : '#EF4444',
                        fillColor: asset.status === 'operational' ? '#22C55E' : 
                                  asset.status === 'maintenance' ? '#EAB308' : '#EF4444',
                        fillOpacity: 0.3,
                        weight: 2
                      }}
                    />
                  ))}
                </LayerGroup>
              </MapContainer>
            </CardContent>
          </Card>
        </div>

        {/* Asset Details Panel */}
        <div className="space-y-4">
          {selectedAsset ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedAsset.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedAsset.assetId}</p>
                </div>

                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedAsset.status)}>
                    {selectedAsset.status}
                  </Badge>
                  <Badge className={getCriticalityColor(selectedAsset.criticality)}>
                    {selectedAsset.criticality}
                  </Badge>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="specs">Specs</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Location</p>
                      <p className="text-sm">{selectedAsset.location}</p>
                      <p className="text-xs text-gray-500">{selectedAsset.locationDetails}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Department</p>
                      <p className="text-sm">{selectedAsset.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Manufacturer</p>
                      <p className="text-sm">{selectedAsset.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Model</p>
                      <p className="text-sm">{selectedAsset.model}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Serial Number</p>
                      <p className="text-sm font-mono text-xs">{selectedAsset.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Installation Date</p>
                      <p className="text-sm">{formatDate(selectedAsset.installationDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Asset Value</p>
                      <p className="text-sm font-bold">{formatCurrency(selectedAsset.cost)}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="specs" className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Condition</p>
                      <p className="text-sm capitalize">{selectedAsset.condition}</p>
                    </div>
                    {Object.entries(selectedAsset.specifications).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm">{value as string}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="maintenance" className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Maintenance</p>
                      <p className="text-sm">{formatDate(selectedAsset.lastMaintenance)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Next Maintenance</p>
                      <p className="text-sm">{formatDate(selectedAsset.nextMaintenance)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maintenance History</p>
                      <p className="text-sm text-gray-500">
                        {selectedAsset.maintenanceHistory.length} records
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedAsset(null)}
                >
                  Close Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Select an Asset</h3>
                <p className="text-gray-600 text-sm">
                  Click on any asset marker on the map to view detailed information
                </p>
              </CardContent>
            </Card>
          )}

          {/* Asset List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset List</CardTitle>
              <CardDescription>
                {filteredAssets.length} assets found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAsset?.id === asset.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{asset.name}</h4>
                        <p className="text-xs text-gray-600">{asset.assetId}</p>
                        <p className="text-xs text-gray-500">{asset.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                        <Badge className={getCriticalityColor(asset.criticality)}>
                          {asset.criticality}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 