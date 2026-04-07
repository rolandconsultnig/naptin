import { useState, useRef } from "react";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type BarcodeFormat = "CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC" | "ITF14" | "MSI" | "pharmacode";
import { Card, CardContent, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Input } from "@eam/components/ui/input";
import { Button } from "@eam/components/ui/button";
import { Label } from "@eam/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eam/components/ui/select";
import { Textarea } from "@eam/components/ui/textarea";
import { Switch } from "@eam/components/ui/switch";
import { Badge } from "@eam/components/ui/badge";
import { Separator } from "@eam/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eam/components/ui/tabs";
import { Download, Printer, Copy, Settings, FileText, QrCode, BarChart3 } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  assetTag: string;
}

const mockAssets: Asset[] = [
  { id: "1", name: "Pump Station A", serialNumber: "PS001", assetTag: "AT001" },
  { id: "2", name: "Compressor Unit B", serialNumber: "CU002", assetTag: "AT002" },
  { id: "3", name: "Valve Assembly C", serialNumber: "VA003", assetTag: "AT003" },
  { id: "4", name: "Tank D", serialNumber: "TK004", assetTag: "AT004" },
  { id: "5", name: "Pipeline E", serialNumber: "PL005", assetTag: "AT005" },
];

const barcodeFormats = [
  { value: "CODE128", label: "Code 128" },
  { value: "CODE39", label: "Code 39" },
  { value: "EAN13", label: "EAN-13" },
  { value: "EAN8", label: "EAN-8" },
  { value: "UPC", label: "UPC" },
  { value: "ITF14", label: "ITF-14" },
  { value: "MSI", label: "MSI" },
  { value: "pharmacode", label: "Pharmacode" },
];

export default function BarcodeGenerator() {
  const [value, setValue] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<BarcodeFormat>("CODE128");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [batchValues, setBatchValues] = useState<string[]>([]);
  const [batchInput, setBatchInput] = useState("");
  const [barcodeOptions, setBarcodeOptions] = useState({
    width: 2,
    height: 100,
    fontSize: 20,
    margin: 10,
    displayValue: true,
  });
  const [qrOptions, setQrOptions] = useState({
    size: 256,
    level: "M",
  });
  const barcodeRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleAssetChange = (assetId: string) => {
    setSelectedAsset(assetId);
    const asset = mockAssets.find(a => a.id === assetId);
    if (asset) {
      setValue(`${asset.assetTag}-${asset.serialNumber}`);
      setBarcodeValue(`${asset.assetTag}-${asset.serialNumber}`);
      setQrValue(JSON.stringify({
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        assetTag: asset.assetTag,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setBarcodeValue(newValue);
    setQrValue(newValue);
  };

  const handleBatchAdd = () => {
    if (batchInput.trim()) {
      setBatchValues([...batchValues, batchInput.trim()]);
      setBatchInput("");
    }
  };

  const handleBatchRemove = (index: number) => {
    setBatchValues(batchValues.filter((_, i) => i !== index));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const generatePDF = async () => {
    if (!barcodeRef.current) return;
    
    const canvas = await html2canvas(barcodeRef.current);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('barcode.pdf');
  };

  const downloadImage = async (type: 'barcode' | 'qr') => {
    const element = type === 'barcode' ? barcodeRef.current : qrRef.current;
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${type}-${value || 'generated'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const printBarcode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && barcodeRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode Print</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .barcode-container { text-align: center; margin: 20px 0; }
              .barcode-info { margin-bottom: 10px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="barcode-info">
                <strong>Value:</strong> ${value}<br>
                <strong>Format:</strong> ${selectedFormat}<br>
                <strong>Generated:</strong> ${new Date().toLocaleString()}
              </div>
              ${barcodeRef.current.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Barcode & QR Code Generator</h1>
        <p className="text-muted-foreground">
          Generate barcodes and QR codes for assets, inventory items, and more.
        </p>
      </div>

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Generator</TabsTrigger>
          <TabsTrigger value="batch">Batch Generator</TabsTrigger>
          <TabsTrigger value="assets">Asset Selection</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Barcode Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode-value">Barcode Value</Label>
                  <Input
                    id="barcode-value"
                    placeholder="Enter value to encode"
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode-format">Barcode Format</Label>
                  <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as BarcodeFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {barcodeFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(value)} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Value
                  </Button>
                  <Button onClick={printBarcode} variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={() => downloadImage('barcode')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-value">QR Code Value</Label>
                  <Textarea
                    id="qr-value"
                    placeholder="Enter text or JSON data for QR code"
                    value={qrValue}
                    onChange={(e) => setQrValue(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(qrValue)} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Value
                  </Button>
                  <Button onClick={() => downloadImage('qr')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Barcode Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={barcodeRef} className="flex justify-center p-4 bg-white">
                  {barcodeValue && (
                    <Barcode
                      value={barcodeValue}
                      format={selectedFormat}
                      width={barcodeOptions.width}
                      height={barcodeOptions.height}
                      fontSize={barcodeOptions.fontSize}
                      margin={barcodeOptions.margin}
                      displayValue={barcodeOptions.displayValue}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={qrRef} className="flex justify-center p-4 bg-white">
                  {qrValue && (
                                         <QRCode
                       value={qrValue}
                       size={qrOptions.size}
                       level={qrOptions.level as "L" | "M" | "Q" | "H"}
                     />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Barcode Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter value for batch"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBatchAdd()}
                />
                <Button onClick={handleBatchAdd}>Add</Button>
              </div>

              <div className="space-y-2">
                <Label>Batch Values ({batchValues.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {batchValues.map((val, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleBatchRemove(index)}>
                      {val} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {batchValues.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batchValues.map((val, index) => (
                      <Card key={index} className="p-4">
                        <div className="text-sm font-medium mb-2">{val}</div>
                        <div className="flex justify-center">
                          <Barcode
                            value={val}
                            format={selectedFormat}
                            width={1.5}
                            height={60}
                            fontSize={12}
                            margin={5}
                            displayValue={true}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Button onClick={generatePDF} className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Export All as PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate from Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset-select">Select Asset</Label>
                <Select value={selectedAsset} onValueChange={handleAssetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetTag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAsset && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Asset Information</Label>
                      <div className="text-sm text-muted-foreground mt-1">
                        {mockAssets.find(a => a.id === selectedAsset)?.name}
                      </div>
                    </div>
                    <div>
                      <Label>Generated Value</Label>
                      <div className="text-sm text-muted-foreground mt-1">
                        {value}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Barcode Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode-width">Width</Label>
                  <Input
                    id="barcode-width"
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={barcodeOptions.width}
                    onChange={(e) => setBarcodeOptions({...barcodeOptions, width: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode-height">Height</Label>
                  <Input
                    id="barcode-height"
                    type="number"
                    min="50"
                    max="200"
                    value={barcodeOptions.height}
                    onChange={(e) => setBarcodeOptions({...barcodeOptions, height: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode-font-size">Font Size</Label>
                  <Input
                    id="barcode-font-size"
                    type="number"
                    min="10"
                    max="30"
                    value={barcodeOptions.fontSize}
                    onChange={(e) => setBarcodeOptions({...barcodeOptions, fontSize: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="display-value"
                    checked={barcodeOptions.displayValue}
                    onCheckedChange={(checked) => setBarcodeOptions({...barcodeOptions, displayValue: checked})}
                  />
                  <Label htmlFor="display-value">Display Value</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size">Size</Label>
                  <Input
                    id="qr-size"
                    type="number"
                    min="128"
                    max="512"
                    step="32"
                    value={qrOptions.size}
                    onChange={(e) => setQrOptions({...qrOptions, size: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-level">Error Correction Level</Label>
                  <Select value={qrOptions.level} onValueChange={(value) => setQrOptions({...qrOptions, level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 