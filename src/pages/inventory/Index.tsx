import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Search, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';

// Sample batch data - in a real app this would come from an API
const batchData = [
  {
    id: "ON-124",
    quantity: "500 kg",
    qualityScore: 95,
    daysUntilExpiry: 45,
    location: "Cold Storage A",
    lastUpdated: "2 hours ago",
    status: "healthy",
    priority: 1
  },
  {
    id: "ON-089",
    quantity: "1200 kg",
    qualityScore: 48,
    daysUntilExpiry: 12,
    location: "Natural Ventilation B",
    lastUpdated: "1 day ago",
    status: "at-risk",
    priority: 2
  },
  {
    id: "ON-112",
    quantity: "750 kg",
    qualityScore: 25,
    daysUntilExpiry: 5,
    location: "Cold Storage A",
    lastUpdated: "30 mins ago",
    status: "critical",
    priority: 3
  },
  {
    id: "ON-126",
    quantity: "800 kg",
    qualityScore: 88,
    daysUntilExpiry: 38,
    location: "Cold Storage A",
    lastUpdated: "4 hours ago",
    status: "healthy",
    priority: 1
  },
  {
    id: "ON-101",
    quantity: "600 kg",
    qualityScore: 72,
    daysUntilExpiry: 22,
    location: "Natural Ventilation B",
    lastUpdated: "6 hours ago",
    status: "healthy",
    priority: 1
  }
];

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const getStatusBadge = (score: number) => {
    if (score >= 80) return { variant: "success" as const, text: `${score}%` };
    if (score >= 50) return { variant: "warning" as const, text: `${score}%` };
    return { variant: "destructive" as const, text: `${score}%` };
  };

  const filteredAndSortedBatches = useMemo(() => {
    let filtered = batchData.filter(batch => {
      const matchesSearch = batch.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
      const matchesLocation = locationFilter === "all" || 
        (locationFilter === "loc-a" && batch.location === "Cold Storage A") ||
        (locationFilter === "loc-b" && batch.location === "Natural Ventilation B");
      
      return matchesSearch && matchesStatus && matchesLocation;
    });

    // Sort by priority first (critical items first), then by selected criteria
    filtered.sort((a, b) => {
      // Primary sort: Critical items first (higher priority number = more urgent)
      if (a.status === "critical" && b.status !== "critical") return -1;
      if (b.status === "critical" && a.status !== "critical") return 1;
      if (a.status === "at-risk" && b.status === "healthy") return -1;
      if (b.status === "at-risk" && a.status === "healthy") return 1;

      // Secondary sort: by selected criteria
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "priority":
          aValue = a.priority;
          bValue = b.priority;
          break;
        case "expiry":
          aValue = a.daysUntilExpiry;
          bValue = b.daysUntilExpiry;
          break;
        case "quality":
          aValue = a.qualityScore;
          bValue = b.qualityScore;
          break;
        case "quantity":
          aValue = parseInt(a.quantity);
          bValue = parseInt(b.quantity);
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, locationFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Inventory</CardTitle>
        <CardDescription>Search, filter, and manage your onion batches. Critical items are prioritized.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Batch ID..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="loc-a">Cold Storage A</SelectItem>
              <SelectItem value="loc-b">Natural Ventilation B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedBatches.length} of {batchData.length} batches
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("id")} className="h-auto p-0 font-semibold">
                  Batch ID <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("quantity")} className="h-auto p-0 font-semibold">
                  Current Quantity <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("quality")} className="h-auto p-0 font-semibold">
                  Quality Score <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("expiry")} className="h-auto p-0 font-semibold">
                  Days Until Expiry <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Storage Location</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? `No batches found matching "${searchTerm}"` : "No batches found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBatches.map((batch) => {
                const statusBadge = getStatusBadge(batch.qualityScore);
                return (
                  <TableRow key={batch.id} className={batch.status === "critical" ? "bg-red-50 border-red-200" : batch.status === "at-risk" ? "bg-yellow-50 border-yellow-200" : ""}>
                    <TableCell className="font-medium">{batch.id}</TableCell>
                    <TableCell>{batch.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                    </TableCell>
                    <TableCell className={batch.daysUntilExpiry <= 7 ? "text-red-600 font-semibold" : batch.daysUntilExpiry <= 14 ? "text-yellow-600" : ""}>
                      {batch.daysUntilExpiry} days
                    </TableCell>
                    <TableCell>{batch.location}</TableCell>
                    <TableCell>{batch.lastUpdated}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/inventory/${batch.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Generate Alert</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventoryPage;
