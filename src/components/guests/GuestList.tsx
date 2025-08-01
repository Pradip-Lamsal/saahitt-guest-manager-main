import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { CustomField } from "@/types/custom-field";
import { Category } from "@/types/category";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
} from "lucide-react";
import PDFPreviewDialog from "../pdf/PDFPreviewDialog";
import { useToast } from "@/components/ui/use-toast";
import { useGuestData } from "@/hooks/useGuestData";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import GuestDetailView from "./GuestDetailView";
import BulkImportDialog from "./BulkImportDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const categoryColors = {
  Family: "bg-purple-100 text-purple-800 border-purple-200",
  Friends: "bg-blue-100 text-blue-800 border-blue-200",
  Work: "bg-orange-100 text-orange-800 border-orange-200",
  Others: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusColors = {
  Confirmed: "bg-green-100 text-green-800",
  Maybe: "bg-yellow-100 text-yellow-800",
  Unavailable: "bg-red-100 text-red-800",
  Pending: "bg-gray-100 text-gray-800",
};

const rsvpStatusColors = {
  accepted: "bg-green-100 text-green-800 border-green-200",
  declined: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200",
};

const GuestList = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [viewGuestId, setViewGuestId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const { toast } = useToast();
  const { guests, isLoading, isFetching, refetch, updateGuest } = useGuestData();

  const { data: customFields = [], isLoading: isLoadingFields } = useQuery({
    queryKey: ["customFields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch custom fields",
        });
        throw error;
      }

      return (
        data?.map((field) => ({
          ...field,
          field_type: field.field_type as CustomField["field_type"],
          options: (field.options as string[]) || [],
        })) || []
      );
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    if (value === "all") {
      const newFilters = { ...filters };
      delete newFilters[field];
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const searchGuests = (guest: Guest) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fullName = `${guest.first_name} ${guest.last_name || ""}`.toLowerCase();
    const emailMatch = guest.email?.toLowerCase().includes(query) || false;
    const phoneMatch = guest.phone?.toLowerCase().includes(query) || false;
    const nameMatch = fullName.includes(query);
    
    return nameMatch || emailMatch || phoneMatch;
  };

  const filteredGuests = guests.filter((guest) => {
    const filterMatch = Object.entries(filters).every(([field, value]) => {
      if (!value || value === "all") return true;

      if (field === "category" || field === "priority" || field === "status") {
        return guest[field] === value;
      }
      
      if (field === "rsvp_status") {
        return guest.rsvp_status === value;
      }

      if (field === "invited") {
        if (value === "yes") return !!guest.invited_at;
        if (value === "no") return !guest.invited_at;
        return true;
      }

      const customValue = guest.custom_values?.[field];
      return customValue === value;
    });

    return filterMatch && searchGuests(guest);
  });

  const totalPages = Math.ceil(filteredGuests.length / pageSize);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const handleGuestClick = (guest: Guest) => {
    setViewGuestId(guest.id);
    setEditMode(false);
  };

  const handleDialogClose = () => {
    setViewGuestId(null);
    setEditMode(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleGuestUpdate = (updatedGuest: Guest) => {
    updateGuest.mutate(updatedGuest, {
      onSuccess: () => {
        setViewGuestId(null);
        setEditMode(false);
      },
    });
  };

  const getCategoryColor = (category: string) => {
    if (category in categoryColors) {
      return categoryColors[category as keyof typeof categoryColors];
    }
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  };

  const FilterLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const loading = isLoading || isLoadingFields;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-4 gap-4 flex-1">
          <div className="space-y-2">
            <Label>
              <FilterLabel 
                label="Category" 
                tooltip="Filter guests by their relationship type (Family, Friends, Work, or custom categories)" 
              />
            </Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              <FilterLabel 
                label="Priority" 
                tooltip="Filter by importance level: High (VIPs), Medium (standard guests), Low (optional attendees)" 
              />
            </Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) => handleFilterChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High (VIP)</SelectItem>
                  <SelectItem value="Medium">Medium (Standard)</SelectItem>
                  <SelectItem value="Low">Low (Optional)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              <FilterLabel 
                label="Status" 
                tooltip="Filter by attendance status: Confirmed (attending), Maybe (undecided), Unavailable (not attending), Pending (not yet responded)" 
              />
            </Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed (Attending)</SelectItem>
                  <SelectItem value="Maybe">Maybe (Undecided)</SelectItem>
                  <SelectItem value="Unavailable">Unavailable (Not Attending)</SelectItem>
                  <SelectItem value="Pending">Pending (No Response)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              <FilterLabel 
                label="RSVP Status" 
                tooltip="Filter by RSVP response: Accepted, Declined, or Pending"
              />
            </Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.rsvp_status || "all"}
                onValueChange={(value) => handleFilterChange("rsvp_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All RSVP Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All RSVP Statuses</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              <FilterLabel 
                label="Invited" 
                tooltip="Filter by invitation status"
              />
            </Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.invited || "all"}
                onValueChange={(value) => handleFilterChange("invited", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Guests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Guests</SelectItem>
                  <SelectItem value="yes">Invited</SelectItem>
                  <SelectItem value="no">Not Invited</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {!loading &&
            customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  <FilterLabel 
                    label={field.name} 
                    tooltip={`Filter guests by their ${field.name} value`} 
                  />
                </Label>
                {field.field_type === "select" ? (
                  <Select
                    value={filters[field.name] || "all"}
                    onValueChange={(value) => handleFilterChange(field.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`All ${field.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{`All ${field.name}`}</SelectItem>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            ))}
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPdfPreviewOpen(true)}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-1" />
            Download List
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label>Rows per page:</Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invitation</TableHead>
              <TableHead>RSVP</TableHead>
              {customFields.map((field) => (
                <TableHead key={field.id}>{field.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  {customFields.map((field) => (
                    <TableCell key={field.id}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedGuests.length > 0 ? (
              paginatedGuests.map((guest) => (
                <TableRow 
                  key={guest.id} 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleGuestClick(guest)}
                >
                  <TableCell>
                    {guest.first_name} {guest.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {guest.email && <div className="text-sm">{guest.email}</div>}
                      {guest.phone && <div className="text-sm">{guest.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(guest.category)}>
                      {guest.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[guest.priority]}>
                      {guest.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[guest.status]}>
                      {guest.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest.invited_at ? (
                      <Badge variant="outline" className="bg-green-50 text-green-800">
                        Sent {new Date(guest.invited_at).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-800">
                        Not Sent
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.rsvp_status && guest.rsvp_status !== 'pending' && guest.rsvp_status !== 'Pending' ? (
                      <Badge className={
                        guest.rsvp_status === 'accepted' || guest.rsvp_status === 'Confirmed'
                          ? rsvpStatusColors.accepted 
                          : rsvpStatusColors.declined
                      }>
                        {guest.rsvp_status === 'accepted' || guest.rsvp_status === 'Confirmed' ? 'Accepted' : 'Declined'}
                        {guest.rsvp_at && ` (${new Date(guest.rsvp_at).toLocaleDateString()})`}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  {customFields.map((field) => (
                    <TableCell key={field.id}>
                      {String(guest.custom_values[field.name] || "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7 + customFields.length}
                  className="text-center py-8"
                >
                  No guests found matching the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {filteredGuests.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, filteredGuests.length)} of{" "}
          {filteredGuests.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!viewGuestId} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Guest" : "Guest Details"}</DialogTitle>
          </DialogHeader>
          {viewGuestId && (
            <GuestDetailView
              guestId={viewGuestId}
              editMode={editMode}
              onEdit={handleEditClick}
              onUpdate={handleGuestUpdate}
              onClose={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
        <BulkImportDialog 
          open={bulkImportOpen} 
          onOpenChange={setBulkImportOpen} 
        />
      </Dialog>

      <PDFPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        guests={filteredGuests}
      />
    </div>
  );
};

export default GuestList;
