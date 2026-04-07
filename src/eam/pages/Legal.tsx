import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Button } from "@eam/components/ui/button";
import { Badge } from "@eam/components/ui/badge";
import { Input } from "@eam/components/ui/input";
import { Label } from "@eam/components/ui/label";
import { Textarea } from "@eam/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eam/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eam/components/ui/tabs";
import { Separator } from "@eam/components/ui/separator";
import { Progress } from "@eam/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Plus,
  Shield,
  Scale,
  Gavel,
  BookOpen,
  Users,
  Building,
  FileCheck,
  FileX,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Square
} from "lucide-react";

interface Contract {
  id: string;
  title: string;
  type: 'service' | 'maintenance' | 'supply' | 'lease' | 'employment' | 'nda' | 'msa';
  status: 'active' | 'expired' | 'pending' | 'terminated' | 'draft';
  vendor: string;
  startDate: Date;
  endDate: Date;
  value: number;
  currency: string;
  description: string;
  terms: string;
  attachments: string[];
  renewalDate?: Date;
  autoRenew: boolean;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending-review';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  responsiblePerson: string;
  department: string;
  tags: string[];
}

interface Compliance {
  id: string;
  title: string;
  category: 'environmental' | 'safety' | 'financial' | 'operational' | 'regulatory' | 'data-protection';
  status: 'compliant' | 'non-compliant' | 'pending' | 'under-review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  lastReview: Date;
  nextReview: Date;
  description: string;
  requirements: string[];
  evidence: string[];
  responsiblePerson: string;
  department: string;
  regulatoryBody: string;
  penalty: number;
  currency: string;
}

interface LegalDocument {
  id: string;
  title: string;
  type: 'policy' | 'procedure' | 'manual' | 'guideline' | 'form' | 'template';
  status: 'active' | 'draft' | 'archived' | 'under-review';
  version: string;
  lastUpdated: Date;
  nextReview: Date;
  author: string;
  department: string;
  description: string;
  content: string;
  attachments: string[];
  tags: string[];
  approvalStatus: 'approved' | 'pending' | 'rejected';
  approvedBy: string;
  approvedDate?: Date;
}

const mockContracts: Contract[] = [
  {
    id: "1",
    title: "Equipment Maintenance Agreement - Siemens",
    type: "maintenance",
    status: "active",
    vendor: "Siemens Industrial Solutions",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    value: 250000,
    currency: "USD",
    description: "Annual maintenance contract for Siemens PLC systems and industrial automation equipment",
    terms: "24/7 support, 4-hour response time, preventive maintenance quarterly",
    attachments: ["contract.pdf", "terms.pdf", "sla.pdf"],
    renewalDate: new Date("2024-11-01"),
    autoRenew: true,
    complianceStatus: "compliant",
    riskLevel: "low",
    responsiblePerson: "John Smith",
    department: "Operations",
    tags: ["maintenance", "automation", "plc"]
  },
  {
    id: "2",
    title: "Software License Agreement - Wonderware",
    type: "service",
    status: "active",
    vendor: "Aveva Group PLC",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2025-02-28"),
    value: 180000,
    currency: "USD",
    description: "SCADA software licensing and support services",
    terms: "Annual license renewal, technical support, software updates",
    attachments: ["license.pdf", "support.pdf"],
    renewalDate: new Date("2025-01-01"),
    autoRenew: false,
    complianceStatus: "pending-review",
    riskLevel: "medium",
    responsiblePerson: "Sarah Johnson",
    department: "IT",
    tags: ["software", "scada", "licensing"]
  },
  {
    id: "3",
    title: "Raw Material Supply Contract - Shell",
    type: "supply",
    status: "active",
    vendor: "Shell Nigeria",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    value: 5000000,
    currency: "NGN",
    description: "Crude oil supply contract for refinery operations",
    terms: "Monthly delivery, quality specifications, payment terms 30 days",
    attachments: ["supply.pdf", "specifications.pdf"],
    renewalDate: new Date("2024-10-01"),
    autoRenew: true,
    complianceStatus: "compliant",
    riskLevel: "high",
    responsiblePerson: "Michael Brown",
    department: "Procurement",
    tags: ["supply", "crude-oil", "refinery"]
  }
];

const mockCompliance: Compliance[] = [
  {
    id: "1",
    title: "Environmental Impact Assessment",
    category: "environmental",
    status: "compliant",
    priority: "high",
    dueDate: new Date("2024-06-30"),
    lastReview: new Date("2024-01-15"),
    nextReview: new Date("2024-07-15"),
    description: "Annual environmental impact assessment for refinery operations",
    requirements: ["EIA report", "Emission monitoring", "Waste management plan"],
    evidence: ["eia-report-2024.pdf", "emission-data.xlsx"],
    responsiblePerson: "Dr. Emily Wilson",
    department: "Environmental",
    regulatoryBody: "Federal Ministry of Environment",
    penalty: 5000000,
    currency: "NGN"
  },
  {
    id: "2",
    title: "Safety Standards Compliance",
    category: "safety",
    status: "compliant",
    priority: "critical",
    dueDate: new Date("2024-05-15"),
    lastReview: new Date("2024-02-01"),
    nextReview: new Date("2024-08-01"),
    description: "Occupational health and safety compliance for industrial operations",
    requirements: ["Safety audits", "Training records", "Incident reports"],
    evidence: ["safety-audit-2024.pdf", "training-records.xlsx"],
    responsiblePerson: "Robert Davis",
    department: "HSE",
    regulatoryBody: "Department of Petroleum Resources",
    penalty: 10000000,
    currency: "NGN"
  },
  {
    id: "3",
    title: "Data Protection Compliance",
    category: "data-protection",
    status: "pending",
    priority: "medium",
    dueDate: new Date("2024-08-31"),
    lastReview: new Date("2024-01-01"),
    nextReview: new Date("2024-09-01"),
    description: "GDPR and local data protection regulation compliance",
    requirements: ["Privacy policy", "Data processing agreements", "Consent mechanisms"],
    evidence: ["privacy-policy.pdf", "dpa-template.docx"],
    responsiblePerson: "Lisa Chen",
    department: "Legal",
    regulatoryBody: "National Information Technology Development Agency",
    penalty: 2000000,
    currency: "NGN"
  }
];

const mockLegalDocuments: LegalDocument[] = [
  {
    id: "1",
    title: "Asset Management Policy",
    type: "policy",
    status: "active",
    version: "2.1",
    lastUpdated: new Date("2024-01-15"),
    nextReview: new Date("2024-07-15"),
    author: "Legal Department",
    department: "Legal",
    description: "Comprehensive policy for enterprise asset management",
    content: "This policy outlines the framework for managing enterprise assets...",
    attachments: ["policy.pdf", "guidelines.pdf"],
    tags: ["policy", "asset-management", "framework"],
    approvalStatus: "approved",
    approvedBy: "Board of Directors",
    approvedDate: new Date("2024-01-15")
  },
  {
    id: "2",
    title: "Maintenance Procedure Manual",
    type: "procedure",
    status: "active",
    version: "1.3",
    lastUpdated: new Date("2024-02-01"),
    nextReview: new Date("2024-08-01"),
    author: "Operations Team",
    department: "Operations",
    description: "Standard operating procedures for equipment maintenance",
    content: "This manual provides detailed procedures for preventive and corrective maintenance...",
    attachments: ["manual.pdf", "checklists.pdf"],
    tags: ["procedure", "maintenance", "operations"],
    approvalStatus: "approved",
    approvedBy: "Operations Director",
    approvedDate: new Date("2024-02-01")
  },
  {
    id: "3",
    title: "Vendor Management Guidelines",
    type: "guideline",
    status: "under-review",
    version: "1.0",
    lastUpdated: new Date("2024-03-01"),
    nextReview: new Date("2024-09-01"),
    author: "Procurement Team",
    department: "Procurement",
    description: "Guidelines for vendor selection and management",
    content: "These guidelines establish criteria for vendor evaluation and ongoing management...",
    attachments: ["guidelines.pdf", "evaluation-criteria.pdf"],
    tags: ["guideline", "vendor-management", "procurement"],
    approvalStatus: "pending",
    approvedBy: "",
    approvedDate: undefined
  }
];

export default function Legal() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [compliance, setCompliance] = useState<Compliance[]>(mockCompliance);
  const [documents, setDocuments] = useState<LegalDocument[]>(mockLegalDocuments);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedCompliance, setSelectedCompliance] = useState<Compliance | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'approved': return 'bg-green-500';
      case 'pending':
      case 'pending-review':
      case 'under-review': return 'bg-yellow-500';
      case 'expired':
      case 'non-compliant':
      case 'rejected': return 'bg-red-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'pending-review':
      case 'under-review': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
      case 'non-compliant':
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft': return <FileText className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <Shield className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'financial': return <TrendingUp className="h-4 w-4" />;
      case 'operational': return <Building className="h-4 w-4" />;
      case 'regulatory': return <Scale className="h-4 w-4" />;
      case 'data-protection': return <FileCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'policy': return <BookOpen className="h-4 w-4" />;
      case 'procedure': return <FileText className="h-4 w-4" />;
      case 'manual': return <BookOpen className="h-4 w-4" />;
      case 'guideline': return <FileCheck className="h-4 w-4" />;
      case 'form': return <FileText className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.status === filterStatus ||
    filterStatus === "all"
  );

  const filteredCompliance = compliance.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status === filterStatus ||
    filterStatus === "all"
  );

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.status === filterStatus ||
    filterStatus === "all"
  );

  const upcomingRenewals = contracts.filter(contract => 
    contract.renewalDate && 
    contract.renewalDate > new Date() && 
    contract.renewalDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const expiringCompliance = compliance.filter(item => 
    item.dueDate > new Date() && 
    item.dueDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Legal Management</h1>
        <p className="text-muted-foreground">
          Manage contracts, compliance, regulatory requirements, and legal documents.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingRenewals.length} renewals due soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((compliance.filter(c => c.status === 'compliant').length / compliance.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {expiringCompliance.length} items due soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Legal Documents</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              {documents.filter(d => d.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {contracts.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length +
               compliance.filter(c => c.priority === 'high' || c.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle className="text-sm">{contract.title}</CardTitle>
                    </div>
                    {getStatusIcon(contract.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vendor:</span>
                      <div className="font-medium">{contract.vendor}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value:</span>
                      <div className="font-medium">
                        {contract.currency} {contract.value.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <div className="font-medium">{contract.startDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <div className="font-medium">{contract.endDate.toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status}
                      </Badge>
                      <Badge className={getRiskColor(contract.riskLevel)}>
                        {contract.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Responsible:</span>
                      <span>{contract.responsiblePerson}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search compliance items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Compliance Item
            </Button>
          </div>

          <div className="space-y-4">
            {filteredCompliance.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    {getStatusIcon(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Category</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge className={`mt-1 ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <div className="mt-1">{item.dueDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <Label>Penalty</Label>
                      <div className="mt-1">
                        {item.currency} {item.penalty.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Update Status
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDocumentTypeIcon(doc.type)}
                      <CardTitle className="text-sm">{doc.title}</CardTitle>
                    </div>
                    {getStatusIcon(doc.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{doc.type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <div className="font-medium">{doc.version}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <div className="font-medium">{doc.department}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <div className="font-medium">{doc.lastUpdated.toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={doc.status === 'active' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                      <Badge variant={doc.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                        {doc.approvalStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Renewals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Upcoming Contract Renewals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingRenewals.length === 0 ? (
                    <p className="text-muted-foreground">No renewals due soon</p>
                  ) : (
                    upcomingRenewals.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{contract.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Renewal: {contract.renewalDate?.toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600">
                          {Math.ceil((contract.renewalDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Due Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Compliance Due Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expiringCompliance.length === 0 ? (
                    <p className="text-muted-foreground">No compliance items due soon</p>
                  ) : (
                    expiringCompliance.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {item.dueDate.toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* High Risk Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  High Risk Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contracts.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{contract.title}</div>
                        <div className="text-sm text-muted-foreground">{contract.vendor}</div>
                      </div>
                      <Badge className={getRiskColor(contract.riskLevel)}>
                        {contract.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Document Reviews Due
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.filter(d => d.nextReview <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Review: {doc.nextReview.toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {Math.ceil((doc.nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 