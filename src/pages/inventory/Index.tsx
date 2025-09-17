import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, ArrowUpDown, Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useInventory, Batch as InventoryBatch } from '@/contexts/InventoryContext';
import { AddBatchDialog } from '@/components/inventory/AddBatchDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';



const InventoryPage = () => {
  const { batches, deleteBatch } = useInventory();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddBatchDialogOpen, setIsAddBatchDialogOpen] = useState(false);

  const getStatusBadge = (score: number) => {
    if (score >= 80) return { variant: "success" as const, text: `${score}%` };
    if (score >= 50) return { variant: "warning" as const, text: `${score}%` };
    return { variant: "destructive" as const, text: `${score}%` };
  };

  const filteredAndSortedBatches = useMemo(() => {
    const filtered = batches.filter((batch) => {
      const matchesSearch = batch.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
      const matchesLocation = locationFilter === "all" || 
        (locationFilter === "loc-a" && batch.location === "Cold Storage A") ||
        (locationFilter === "loc-b" && batch.location === "Natural Ventilation B");
      
      return matchesSearch && matchesStatus && matchesLocation;
    });

    // Sort by priority first (critical items first), then by selected criteria
    filtered.sort((a: InventoryBatch, b: InventoryBatch) => {
      // Primary sort: Critical items first (higher priority number = more urgent)
      if (a.status === "critical" && b.status !== "critical") return -1;
      if (b.status === "critical" && a.status !== "critical") return 1;
      if (a.status === "at-risk" && b.status === "healthy") return -1;
      if (b.status === "at-risk" && a.status === "healthy") return 1;

      // Secondary sort: by selected criteria
      let aValue: number | string | Date;
      let bValue: number | string | Date;
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
  }, [batches, searchTerm, statusFilter, locationFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleEditBatch = (batchId: string) => {
    // Navigate to batch detail page for editing
    navigate(`/dashboard/inventory/${batchId}`);
  };

  const handleDeleteBatch = (batchId: string, batchTitle: string) => {
    try {
      deleteBatch(batchId);
      toast({
        title: "Batch Deleted",
        description: `Batch ${batchTitle} has been successfully deleted from inventory.`,
      });
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the batch. Please try again.",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('nav.inventory')}</h2>
          <p className="text-muted-foreground">
            {t('inventory.manage')}
          </p>
        </div>
        <Button onClick={() => setIsAddBatchDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('button.addNewBatch')}
        </Button>
      </div>

      <Card>
      <CardHeader>
        <CardTitle>{t('inventory.title')}</CardTitle>
        <CardDescription>{t('inventory.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('inventory.searchPlaceholder')} 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder={t('inventory.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('inventory.allStatus')}</SelectItem>
              <SelectItem value="healthy">{t('status.healthy')}</SelectItem>
              <SelectItem value="at-risk">{t('status.atRisk')}</SelectItem>
              <SelectItem value="critical">{t('status.critical')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder={t('inventory.filterByLocation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('inventory.allLocations')}</SelectItem>
              <SelectItem value="loc-a">Cold Storage A</SelectItem>
              <SelectItem value="loc-b">Natural Ventilation B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4 text-sm text-muted-foreground">
          {t('inventory.showingResults', { count: filteredAndSortedBatches.length, total: batches.length })}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("id")} className="h-auto p-0 font-semibold">
                  {t('inventory.batchId')} <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("quantity")} className="h-auto p-0 font-semibold">
                  {t('inventory.currentQuantity')} <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("quality")} className="h-auto p-0 font-semibold">
                  {t('inventory.qualityScore')} <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("expiry")} className="h-auto p-0 font-semibold">
                  {t('inventory.daysUntilExpiry')} <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>{t('inventory.storageLocation')}</TableHead>
              <TableHead>{t('inventory.lastUpdated')}</TableHead>
              <TableHead><span className="sr-only">{t('common.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? t('inventory.noResultsForSearch', { search: searchTerm }) : t('inventory.noResults')}
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
                      {batch.daysUntilExpiry} {t('common.days')}
                    </TableCell>
                    <TableCell>{batch.location}</TableCell>
                    <TableCell>{batch.lastUpdated}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('common.openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/inventory/${batch.id}`} className="flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              {t('button.viewDetails')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBatch(batch.id)} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            {t('button.edit')}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 text-red-600">
                                <Trash2 className="h-4 w-4" />
                                {t('button.delete')}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Batch {batch.id}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this batch? This action cannot be undone.
                                  This will permanently remove the batch "{batch.id}" ({batch.quantity}) from your inventory.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteBatch(batch.id, batch.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    
    <AddBatchDialog
      isOpen={isAddBatchDialogOpen}
      onClose={() => setIsAddBatchDialogOpen(false)}
    />
    </div>
  );
};

export default InventoryPage;
