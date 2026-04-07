import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Search, Filter, Plus, Eye, Edit, Trash2, Calendar, User, File } from 'lucide-react';

interface Document {
  id: number;
  documentNumber: string;
  title: string;
  description: string;
  documentType: string;
  category: string;
  assetId: string;
  assetName: string;
  fileName: string;
  fileSize: number;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate: string | null;
  isActive: boolean;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    setDocuments([
      {
        id: 1,
        documentNumber: 'DOC-001',
        title: 'HVAC System Operation Manual',
        description: 'Complete operation and maintenance manual for main HVAC system',
        documentType: 'manual',
        category: 'Technical',
        assetId: 'ASSET-001',
        assetName: 'Main HVAC System',
        fileName: 'hvac_operation_manual_v2.1.pdf',
        fileSize: 2048576,
        version: '2.1',
        uploadedBy: 'John Smith',
        uploadedAt: '2024-01-15',
        expiryDate: null,
        isActive: true,
      },
      {
        id: 2,
        documentNumber: 'DOC-002',
        title: 'Safety Procedures - Equipment Maintenance',
        description: 'Standard operating procedures for equipment maintenance safety',
        documentType: 'procedure',
        category: 'Safety',
        assetId: null,
        assetName: null,
        fileName: 'safety_procedures_maintenance.pdf',
        fileSize: 1024000,
        version: '1.0',
        uploadedBy: 'Sarah Johnson',
        uploadedAt: '2024-01-10',
        expiryDate: '2024-12-31',
        isActive: true,
      },
      {
        id: 3,
        documentNumber: 'DOC-003',
        title: 'Equipment Warranty - Pump Assembly',
        description: 'Warranty documentation for pump assembly replacement',
        documentType: 'warranty',
        category: 'Legal',
        assetId: 'ASSET-003',
        assetName: 'Pump Assembly A',
        fileName: 'pump_warranty_2024.pdf',
        fileSize: 512000,
        version: '1.0',
        uploadedBy: 'Mike Wilson',
        uploadedAt: '2024-01-05',
        expiryDate: '2026-01-05',
        isActive: true,
      },
    ]);
  }, []);

  const getDocumentTypeBadge = (type: string) => {
    const typeColors = {
      manual: 'bg-blue-100 text-blue-800',
      procedure: 'bg-green-100 text-green-800',
      warranty: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      certificate: 'bg-yellow-100 text-yellow-800',
    };
    return <Badge className={typeColors[type as keyof typeof typeColors]}>{type}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      Technical: 'bg-gray-100 text-gray-800',
      Safety: 'bg-red-100 text-red-800',
      Legal: 'bg-purple-100 text-purple-800',
      Compliance: 'bg-yellow-100 text-yellow-800',
      Training: 'bg-green-100 text-green-800',
    };
    return <Badge className={categoryColors[category as keyof typeof categoryColors]}>{category}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expires Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'expiring' && doc.expiryDate && new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ||
                      (activeTab === 'technical' && doc.documentType === 'manual') ||
                      (activeTab === 'safety' && doc.category === 'Safety');
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Store and organize technical documents, procedures, and compliance files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Active documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical Manuals</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.documentType === 'manual').length}
            </div>
            <p className="text-xs text-muted-foreground">Equipment manuals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.expiryDate && new Date(d.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total file size</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>Manage and organize all documents</CardDescription>
                </div>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload New Document</DialogTitle>
                      <DialogDescription>Add a new document to the library</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Document Title</Label>
                        <Input id="title" placeholder="Enter document title" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Brief description of the document" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="documentType">Document Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="procedure">Procedure</SelectItem>
                              <SelectItem value="warranty">Warranty</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Technical">Technical</SelectItem>
                              <SelectItem value="Safety">Safety</SelectItem>
                              <SelectItem value="Legal">Legal</SelectItem>
                              <SelectItem value="Compliance">Compliance</SelectItem>
                              <SelectItem value="Training">Training</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="asset">Related Asset (Optional)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asset-001">Main HVAC System</SelectItem>
                            <SelectItem value="asset-002">Production Line A</SelectItem>
                            <SelectItem value="asset-003">Pump Assembly A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="file">Upload File</Label>
                        <Input id="file" type="file" />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                        <Input id="expiryDate" type="date" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button>Upload Document</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.documentNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-muted-foreground">{doc.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getDocumentTypeBadge(doc.documentType)}</TableCell>
                      <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                      <TableCell>{doc.assetName || '-'}</TableCell>
                      <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell>{doc.version}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{doc.uploadedAt}</div>
                          <div className="text-xs text-muted-foreground">by {doc.uploadedBy}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.expiryDate ? getExpiryStatus(doc.expiryDate) : 
                         <Badge className="bg-green-100 text-green-800">Active</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 