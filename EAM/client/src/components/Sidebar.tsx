import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Box,
  Calendar,
  Cpu,
  Map,
  Settings,
  Truck,
  Users,
  Warehouse,
  Wrench,
  ShoppingCart,
  Car,
  Gauge,
  Zap,
  FileText,
  Building,
  Target,
  Activity,
  ChevronRight,
  Scale,
  Calculator,
  Navigation,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: BarChart3,
    description: "Overview and analytics"
  },
  { 
    name: "Asset Register", 
    href: "/assets", 
    icon: Box,
    description: "Manage all assets"
  },
  { 
    name: "Asset Tracking", 
    href: "/asset-tracking", 
    icon: Navigation,
    description: "Real-time asset tracking"
  },
  { 
    name: "Depreciation", 
    href: "/depreciation", 
    icon: Calculator,
    description: "Asset depreciation management"
  },
  { 
    name: "Barcode Generator", 
    href: "/barcode-generator", 
    icon: Target,
    description: "Generate barcodes and QR codes"
  },
  { 
    name: "Hardware Management", 
    href: "/hardware", 
    icon: Settings,
    description: "Hardware devices and equipment"
  },
  { 
    name: "Industrial IoT", 
    href: "/iot", 
    icon: Cpu,
    description: "IoT monitoring and control"
  },
  { 
    name: "Asset Map", 
    href: "/asset-map", 
    icon: Map,
    description: "Geographic asset visualization"
  },
  { 
    name: "Work Orders", 
    href: "/work-orders", 
    icon: Wrench,
    description: "Maintenance work orders"
  },
  { 
    name: "Maintenance Schedule", 
    href: "/maintenance", 
    icon: Calendar,
    description: "Scheduled maintenance"
  },
  { 
    name: "Inventory", 
    href: "/inventory", 
    icon: Warehouse,
    description: "Stock and spare parts"
  },
  { 
    name: "Procurement", 
    href: "/procurement", 
    icon: ShoppingCart,
    description: "Purchase and procurement"
  },
  { 
    name: "Fleet Management", 
    href: "/fleet", 
    icon: Car,
    description: "Vehicle fleet operations"
  },
  { 
    name: "Calibration", 
    href: "/calibration", 
    icon: Gauge,
    description: "Equipment calibration"
  },
  { 
    name: "Energy Management", 
    href: "/energy", 
    icon: Zap,
    description: "Energy monitoring and optimization"
  },
  { 
    name: "Documents", 
    href: "/documents", 
    icon: FileText,
    description: "Document management"
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3,
    description: "Analytics and reporting"
  },
  { 
    name: "Legal", 
    href: "/legal", 
    icon: Scale,
    description: "Contracts and compliance"
  },
  { 
    name: "User Management", 
    href: "/users", 
    icon: Users,
    description: "User accounts and permissions"
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    description: "System configuration"
  },
  { 
    name: "Database Management", 
    href: "/database", 
    icon: Activity,
    description: "Dual database operations"
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 glass border-r border-white/20 backdrop-blur-md transition-all duration-300 ease-in-out pt-16",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="h-full px-4 py-6 overflow-y-auto">
        {/* Sidebar Header */}
        <div className="mb-6 p-4 rounded-xl gradient-primary text-white">
          <h2 className="text-lg font-bold">Navigation</h2>
          <p className="text-sm opacity-90">NNPC EAM System</p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden",
                  isActive
                    ? "gradient-primary text-white shadow-lg transform scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-md hover:transform hover:scale-102"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background gradient for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-90"></div>
                )}
                
                {/* Icon */}
                <div className={cn(
                  "relative z-10 p-2 rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Text content */}
                <div className="relative z-10 ml-3 flex-1">
                  <span className="font-medium text-sm">{item.name}</span>
                  <p className={cn(
                    "text-xs mt-0.5 transition-opacity duration-300",
                    isActive 
                      ? "text-white/80" 
                      : "text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100"
                  )}>
                    {item.description}
                  </p>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="relative z-10 w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
                )}
                
                {/* Hover arrow */}
                <ChevronRight className={cn(
                  "relative z-10 w-4 h-4 transition-all duration-300",
                  isActive 
                    ? "text-white" 
                    : "text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">System Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
