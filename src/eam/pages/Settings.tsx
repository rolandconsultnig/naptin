import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Button } from "@eam/components/ui/button";
import { Badge } from "@eam/components/ui/badge";
import { Input } from "@eam/components/ui/input";
import { Label } from "@eam/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eam/components/ui/select";
import { Textarea } from "@eam/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eam/components/ui/tabs";
import { Separator } from "@eam/components/ui/separator";
import { Switch } from "@eam/components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Bell,
  Shield,
  Database,
  Globe,
  Palette,
  Clock,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Eye,
  Lock,
  Unlock,
  Activity,
  Zap,
  Building,
  Users,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Package,
  Server,
  Network,
  Key,
  ExternalLink,
  TestTube,
  Wifi,
  WifiOff,
  Database as DatabaseIcon,
  Cloud,
  CloudOff,
  ShoppingCart
} from "lucide-react";

interface SystemSettings {
  general: {
    companyName: string;
    timezone: string;
    dateFormat: string;
    language: string;
    currency: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    workOrderAlerts: boolean;
    maintenanceReminders: boolean;
    inventoryAlerts: boolean;
    systemAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  maintenance: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    maintenanceWindow: string;
  };
  integrations: {
    emailProvider: string;
    smsProvider: string;
    calendarSync: boolean;
    apiEnabled: boolean;
  };
  erp: {
    enabled: boolean;
    system: string;
    connection: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
      ssl: boolean;
    };
    syncSettings: {
      assets: boolean;
      workOrders: boolean;
      inventory: boolean;
      procurement: boolean;
      financial: boolean;
      hr: boolean;
    };
    mapping: {
      assetFields: Record<string, string>;
      workOrderFields: Record<string, string>;
      inventoryFields: Record<string, string>;
    };
    schedule: {
      enabled: boolean;
      frequency: string;
      lastSync: Date | null;
      nextSync: Date | null;
    };
  };
}

const defaultSettings: SystemSettings = {
  general: {
    companyName: "NNPC Refineries",
    timezone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
    language: "en",
    currency: "NGN"
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    workOrderAlerts: true,
    maintenanceReminders: true,
    inventoryAlerts: true,
    systemAlerts: false
  },
  security: {
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    twoFactorAuth: false,
    ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"]
  },
  maintenance: {
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
    maintenanceWindow: "02:00-04:00"
  },
  integrations: {
    emailProvider: "smtp",
    smsProvider: "twilio",
    calendarSync: true,
    apiEnabled: true
  },
  erp: {
    enabled: false,
    system: "sap",
    connection: {
      host: "",
      port: 3300,
      username: "",
      password: "",
      database: "",
      ssl: true
    },
    syncSettings: {
      assets: true,
      workOrders: true,
      inventory: true,
      procurement: false,
      financial: false,
      hr: false
    },
    mapping: {
      assetFields: {
        "asset_id": "EQUIPMENT_ID",
        "name": "DESCRIPTION",
        "location": "LOCATION_CODE",
        "status": "EQUIPMENT_STATUS"
      },
      workOrderFields: {
        "work_order_id": "ORDER_ID",
        "title": "ORDER_DESCRIPTION",
        "priority": "PRIORITY_LEVEL",
        "status": "ORDER_STATUS"
      },
      inventoryFields: {
        "item_id": "MATERIAL_ID",
        "name": "MATERIAL_DESCRIPTION",
        "quantity": "QUANTITY",
        "unit": "UNIT_OF_MEASURE"
      }
    },
    schedule: {
      enabled: false,
      frequency: "daily",
      lastSync: null,
      nextSync: null
    }
  }
};

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedSetting = (section: keyof SystemSettings, parentKey: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...(prev[section] as any)[parentKey],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
    setIsSaving(false);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  const createBackup = () => {
    // Simulate backup creation
    console.log("Creating system backup...");
    setShowBackupModal(false);
  };

  const restoreBackup = () => {
    // Simulate backup restoration
    console.log("Restoring system backup...");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Settings</h1>
            <p className="text-muted-foreground">
              Configure system preferences, security, and maintenance settings.
            </p>
          </div>
          <div className="flex space-x-2">
            {hasChanges && (
              <Button variant="outline" onClick={resetSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="erp">ERP Integration</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={settings.general.companyName}
                  onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={settings.general.dateFormat} onValueChange={(value) => updateSetting('general', 'dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.general.language} onValueChange={(value) => updateSetting('general', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.general.currency} onValueChange={(value) => updateSetting('general', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Notification Channels</Label>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Notifications</span>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>SMS Notifications</span>
                    </div>
                    <Switch
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => updateSetting('notifications', 'sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>Push Notifications</span>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Alert Types</Label>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Work Order Alerts</span>
                    </div>
                    <Switch
                      checked={settings.notifications.workOrderAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'workOrderAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Maintenance Reminders</span>
                    </div>
                    <Switch
                      checked={settings.notifications.maintenanceReminders}
                      onCheckedChange={(checked) => updateSetting('notifications', 'maintenanceReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Inventory Alerts</span>
                    </div>
                    <Switch
                      checked={settings.notifications.inventoryAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'inventoryAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>System Alerts</span>
                    </div>
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Select value={settings.security.sessionTimeout.toString()} onValueChange={(value) => updateSetting('security', 'sessionTimeout', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Password Policy</Label>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Select value={settings.security.passwordPolicy.minLength.toString()} onValueChange={(value) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Require Uppercase Letters</span>
                      <Switch
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require Lowercase Letters</span>
                      <Switch
                        checked={settings.security.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireLowercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require Numbers</span>
                      <Switch
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require Special Characters</span>
                      <Switch
                        checked={settings.security.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireSpecialChars', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="ip-whitelist">IP Whitelist (one per line)</Label>
                  <Textarea
                    id="ip-whitelist"
                    value={settings.security.ipWhitelist.join('\n')}
                    onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Automatic Backups</span>
                  </div>
                  <Switch
                    checked={settings.maintenance.autoBackup}
                    onCheckedChange={(checked) => updateSetting('maintenance', 'autoBackup', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={settings.maintenance.backupFrequency} onValueChange={(value) => updateSetting('maintenance', 'backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={settings.maintenance.retentionDays}
                    onChange={(e) => updateSetting('maintenance', 'retentionDays', parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance-window">Maintenance Window</Label>
                  <Select value={settings.maintenance.maintenanceWindow} onValueChange={(value) => updateSetting('maintenance', 'maintenanceWindow', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00:00-02:00">00:00 - 02:00</SelectItem>
                      <SelectItem value="02:00-04:00">02:00 - 04:00</SelectItem>
                      <SelectItem value="04:00-06:00">04:00 - 06:00</SelectItem>
                      <SelectItem value="22:00-00:00">22:00 - 00:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                External Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email-provider">Email Provider</Label>
                  <Select value={settings.integrations.emailProvider} onValueChange={(value) => updateSetting('integrations', 'emailProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="aws-ses">AWS SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sms-provider">SMS Provider</Label>
                  <Select value={settings.integrations.smsProvider} onValueChange={(value) => updateSetting('integrations', 'smsProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                      <SelectItem value="africastalking">Africa's Talking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar Synchronization</span>
                  </div>
                  <Switch
                    checked={settings.integrations.calendarSync}
                    onCheckedChange={(checked) => updateSetting('integrations', 'calendarSync', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>API Access</span>
                  </div>
                  <Switch
                    checked={settings.integrations.apiEnabled}
                    onCheckedChange={(checked) => updateSetting('integrations', 'apiEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                ERP System Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>Enable ERP Integration</span>
                </div>
                <Switch
                  checked={settings.erp.enabled}
                  onCheckedChange={(checked) => updateSetting('erp', 'enabled', checked)}
                />
              </div>

              {settings.erp.enabled && (
                <>
                  <Separator />

                  <div>
                    <Label htmlFor="erp-system">ERP System</Label>
                    <Select value={settings.erp.system} onValueChange={(value) => updateSetting('erp', 'system', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sap">SAP ERP</SelectItem>
                        <SelectItem value="oracle">Oracle ERP Cloud</SelectItem>
                        <SelectItem value="dynamics">Microsoft Dynamics 365</SelectItem>
                        <SelectItem value="netsuite">Oracle NetSuite</SelectItem>
                        <SelectItem value="sage">Sage X3</SelectItem>
                        <SelectItem value="infor">Infor CloudSuite</SelectItem>
                        <SelectItem value="ifs">IFS Applications</SelectItem>
                        <SelectItem value="maximo">IBM Maximo</SelectItem>
                        <SelectItem value="custom">Custom ERP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Connection Settings</Label>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="erp-host">Host/Server</Label>
                        <Input
                          id="erp-host"
                          value={settings.erp.connection.host}
                          onChange={(e) => updateNestedSetting('erp', 'connection', 'host', e.target.value)}
                          placeholder="erp.company.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="erp-port">Port</Label>
                        <Input
                          id="erp-port"
                          type="number"
                          value={settings.erp.connection.port}
                          onChange={(e) => updateNestedSetting('erp', 'connection', 'port', parseInt(e.target.value))}
                          placeholder="3300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="erp-username">Username</Label>
                        <Input
                          id="erp-username"
                          value={settings.erp.connection.username}
                          onChange={(e) => updateNestedSetting('erp', 'connection', 'username', e.target.value)}
                          placeholder="erp_user"
                        />
                      </div>
                      <div>
                        <Label htmlFor="erp-password">Password</Label>
                        <Input
                          id="erp-password"
                          type="password"
                          value={settings.erp.connection.password}
                          onChange={(e) => updateNestedSetting('erp', 'connection', 'password', e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <Label htmlFor="erp-database">Database/Schema</Label>
                        <Input
                          id="erp-database"
                          value={settings.erp.connection.database}
                          onChange={(e) => updateNestedSetting('erp', 'connection', 'database', e.target.value)}
                          placeholder="ERP_DB"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="h-4 w-4" />
                          <span>Use SSL/TLS</span>
                        </div>
                        <Switch
                          checked={settings.erp.connection.ssl}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'connection', 'ssl', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Synchronization Settings</Label>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Assets & Equipment</span>
                        </div>
                        <Switch
                          checked={settings.erp.syncSettings.assets}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'syncSettings', 'assets', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Work Orders</span>
                        </div>
                        <Switch
                          checked={settings.erp.syncSettings.workOrders}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'syncSettings', 'workOrders', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>Inventory & Materials</span>
                        </div>
                        <Switch
                          checked={settings.erp.syncSettings.inventory}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'syncSettings', 'inventory', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Procurement</span>
                        </div>
                        <Switch
                          checked={settings.erp.syncSettings.procurement}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'syncSettings', 'procurement', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Financial Data</span>
                        </div>
                        <Switch
                          checked={settings.erp.syncSettings.financial}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'syncSettings', 'financial', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>HR & Personnel</span>
                        </div>
                        <Switch
                          checked={settings.erp.syncSettings.hr}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'syncSettings', 'hr', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Synchronization Schedule</Label>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Enable Scheduled Sync</span>
                        </div>
                        <Switch
                          checked={settings.erp.schedule.enabled}
                          onCheckedChange={(checked) => updateNestedSetting('erp', 'schedule', 'enabled', checked)}
                        />
                      </div>
                      {settings.erp.schedule.enabled && (
                        <div>
                          <Label htmlFor="sync-frequency">Sync Frequency</Label>
                          <Select value={settings.erp.schedule.frequency} onValueChange={(value) => updateNestedSetting('erp', 'schedule', 'frequency', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Manual Sync
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                  </div>

                  {settings.erp.schedule.lastSync && (
                    <div className="text-sm text-muted-foreground">
                      Last sync: {settings.erp.schedule.lastSync.toLocaleString()}
                      {settings.erp.schedule.nextSync && (
                        <span> • Next sync: {settings.erp.schedule.nextSync.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {settings.erp.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5" />
                  Field Mapping Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Asset Field Mapping</Label>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Asset ID</Label>
                      <Input
                        value={settings.erp.mapping.assetFields["asset_id"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'assetFields', { ...settings.erp.mapping.assetFields, "asset_id": e.target.value })}
                        placeholder="EQUIPMENT_ID"
                      />
                    </div>
                    <div>
                      <Label>Asset Name</Label>
                      <Input
                        value={settings.erp.mapping.assetFields["name"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'assetFields', { ...settings.erp.mapping.assetFields, "name": e.target.value })}
                        placeholder="DESCRIPTION"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={settings.erp.mapping.assetFields["location"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'assetFields', { ...settings.erp.mapping.assetFields, "location": e.target.value })}
                        placeholder="LOCATION_CODE"
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input
                        value={settings.erp.mapping.assetFields["status"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'assetFields', { ...settings.erp.mapping.assetFields, "status": e.target.value })}
                        placeholder="EQUIPMENT_STATUS"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Work Order Field Mapping</Label>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Work Order ID</Label>
                      <Input
                        value={settings.erp.mapping.workOrderFields["work_order_id"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'workOrderFields', { ...settings.erp.mapping.workOrderFields, "work_order_id": e.target.value })}
                        placeholder="ORDER_ID"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={settings.erp.mapping.workOrderFields["title"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'workOrderFields', { ...settings.erp.mapping.workOrderFields, "title": e.target.value })}
                        placeholder="ORDER_DESCRIPTION"
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input
                        value={settings.erp.mapping.workOrderFields["priority"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'workOrderFields', { ...settings.erp.mapping.workOrderFields, "priority": e.target.value })}
                        placeholder="PRIORITY_LEVEL"
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input
                        value={settings.erp.mapping.workOrderFields["status"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'workOrderFields', { ...settings.erp.mapping.workOrderFields, "status": e.target.value })}
                        placeholder="ORDER_STATUS"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Inventory Field Mapping</Label>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Item ID</Label>
                      <Input
                        value={settings.erp.mapping.inventoryFields["item_id"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'inventoryFields', { ...settings.erp.mapping.inventoryFields, "item_id": e.target.value })}
                        placeholder="MATERIAL_ID"
                      />
                    </div>
                    <div>
                      <Label>Item Name</Label>
                      <Input
                        value={settings.erp.mapping.inventoryFields["name"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'inventoryFields', { ...settings.erp.mapping.inventoryFields, "name": e.target.value })}
                        placeholder="MATERIAL_DESCRIPTION"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        value={settings.erp.mapping.inventoryFields["quantity"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'inventoryFields', { ...settings.erp.mapping.inventoryFields, "quantity": e.target.value })}
                        placeholder="QUANTITY"
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        value={settings.erp.mapping.inventoryFields["unit"] || ""}
                        onChange={(e) => updateNestedSetting('erp', 'mapping', 'inventoryFields', { ...settings.erp.mapping.inventoryFields, "unit": e.target.value })}
                        placeholder="UNIT_OF_MEASURE"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Create Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Create a complete backup of your system data including assets, work orders, and configurations.
                </p>
                <Button onClick={() => setShowBackupModal(true)} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restore Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Restore your system from a previously created backup file.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Backup File
                  </Button>
                  <Button variant="outline" className="w-full" onClick={restoreBackup}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">System Backup - 2024-01-20</p>
                    <p className="text-sm text-muted-foreground">2.5 GB • Completed</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">System Backup - 2024-01-19</p>
                    <p className="text-sm text-muted-foreground">2.4 GB • Completed</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create System Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This will create a complete backup of your system. The process may take several minutes.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Assets and configurations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Work orders and maintenance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">User data and permissions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">System settings</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={createBackup}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowBackupModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 