import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { EventGuest, InviteMethod } from "@/types/event";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Mail, MessageSquare, Phone, UserCircle, MoreHorizontal, CheckCircle, UserPlus } from "lucide-react";
import InviteDialog from "./InviteDialog";

interface EventGuestManagerProps {
  event: { id: string; name: string };
  guests: Guest[];
  eventGuests: Record<string, EventGuest[]>;
  onGuestToggle: (eventId: string, guestId: string) => void;
  onBulkGuestToggle: (eventId: string, guestIds: string[], add: boolean) => void;
  onUpdateInviteStatus: (
    eventId: string,
    guestId: string,
    details: {
      invite_sent: boolean;
      invite_method?: string;
      invite_notes?: string;
    }
  ) => void;
}

const EventGuestManager = ({
  event,
  guests,
  eventGuests,
  onGuestToggle,
  onBulkGuestToggle,
  onUpdateInviteStatus,
}: EventGuestManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInviteMethod, setSelectedInviteMethod] = useState<InviteMethod>("Email");
  const [inviteNotes, setInviteNotes] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const currentEventGuests = eventGuests[event.id] || [];
  const currentEventGuestIds = new Set(currentEventGuests.map(eg => eg.guest_id));

  const availableGuests = guests.filter(guest => !currentEventGuestIds.has(guest.id));
  const invitedGuests = guests.filter(guest => currentEventGuestIds.has(guest.id));

  const filteredAvailableGuests = availableGuests.filter((guest) => {
    const matchesSearch = 
      guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || guest.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredInvitedGuests = invitedGuests.filter((guest) => {
    const matchesSearch = 
      guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || guest.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  useEffect(() => {
    if (selectAll) {
      const currentGuests = activeTab === "available" ? filteredAvailableGuests : filteredInvitedGuests;
      setSelectedGuestIds(currentGuests.map(guest => guest.id));
    } else {
      setSelectedGuestIds([]);
    }
  }, [selectAll, activeTab, filteredAvailableGuests, filteredInvitedGuests]);

  useEffect(() => {
    setSelectedGuestIds([]);
    setSelectAll(false);
  }, [activeTab]);

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuestIds(prev => 
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-800";
      case "Maybe": return "bg-yellow-100 text-yellow-800";
      case "Unavailable": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Family": return "bg-purple-100 text-purple-800";
      case "Friends": return "bg-blue-100 text-blue-800";
      case "Work": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectAll = () => {
    const guestIds = activeTab === "available" 
      ? filteredAvailableGuests.map(guest => guest.id)
      : [];
    
    if (guestIds.length > 0) {
      onBulkGuestToggle(event.id, guestIds, true);
    }
  };

  const handleDeselectAll = () => {
    const guestIds = activeTab === "invited" 
      ? filteredInvitedGuests.map(guest => guest.id)
      : [];
    
    if (guestIds.length > 0) {
      onBulkGuestToggle(event.id, guestIds, false);
    }
  };

  const getInviteMethodIcon = (method: InviteMethod) => {
    switch (method) {
      case "Email": return <Mail className="h-4 w-4" />;
      case "WhatsApp": return <MessageSquare className="h-4 w-4" />;
      case "Phone": return <Phone className="h-4 w-4" />;
      case "In Person": return <UserCircle className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const handleInviteStatusUpdate = (guestId: string) => {
    onUpdateInviteStatus(event.id, guestId, {
      invite_sent: true,
      invite_method: selectedInviteMethod,
      invite_notes: inviteNotes,
    });
    setSelectedGuestId(null);
    setInviteNotes("");
  };

  const handleBulkInviteSend = () => {
    if (selectedGuestIds.length > 0) {
      setInviteDialogOpen(true);
    }
  };

  const renderGuestItem = (guest: Guest, isInvited: boolean) => {
    const eventGuest = currentEventGuests.find(eg => eg.guest_id === guest.id);
    const isSelected = selectedGuestIds.includes(guest.id);
    
    return (
      <div key={guest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition-colors">
        <div className="flex items-center space-x-3 flex-1">
          <Checkbox
            id={`guest-${guest.id}`}
            checked={isInvited}
            onCheckedChange={() => onGuestToggle(event.id, guest.id)}
          />
          <div className="flex-1">
            <label
              htmlFor={`guest-${guest.id}`}
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {guest.first_name} {guest.last_name}
            </label>
            {guest.email && (
              <p className="text-sm text-gray-500">{guest.email}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(guest.category || 'Others')}>
              {guest.category || 'Others'}
            </Badge>
            <Badge className={getStatusColor(guest.status)}>
              {guest.status}
            </Badge>
            {guest.rsvp_status && guest.rsvp_status !== 'pending' && guest.rsvp_status !== 'Pending' && (
              <Badge className={
                guest.rsvp_status === 'accepted' || guest.rsvp_status === 'Confirmed' 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-red-100 text-red-800 border-red-200"
              }>
                {guest.rsvp_status === 'accepted' || guest.rsvp_status === 'Confirmed' ? 'Accepted' : 'Declined'}
              </Badge>
            )}
          </div>
        </div>
        <div className="ml-4 flex gap-2">
          {isInvited && (
            <>
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => toggleGuestSelection(guest.id)}
                className="mr-2"
                aria-label={`Select ${guest.first_name}`}
              />
              
              {eventGuest?.invite_sent ? (
                <Badge variant="outline" className="bg-green-50 flex items-center gap-1">
                  {getInviteMethodIcon(eventGuest.invite_method as InviteMethod)}
                  <span>Invite Sent</span>
                </Badge>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGuestId(guest.id)}
                    >
                      Mark Invite Sent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Invite Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Invite Method</Label>
                        <Select
                          value={selectedInviteMethod}
                          onValueChange={(value) => setSelectedInviteMethod(value as InviteMethod)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="In Person">In Person</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={inviteNotes}
                          onChange={(e) => setInviteNotes(e.target.value)}
                          placeholder="Add any notes about the invitation..."
                        />
                      </div>
                      <Button
                        onClick={() => handleInviteStatusUpdate(guest.id)}
                        className="w-full"
                      >
                        Update Status
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Manage Guests for {event.name}</CardTitle>
        <CardDescription>
          Select guests to invite to this event and track invitation status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Friends">Friends</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Maybe">Maybe</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Available Guests ({filteredAvailableGuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="invited" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Invited Guests ({filteredInvitedGuests.length})</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all-guests"
                checked={selectAll}
                onCheckedChange={(checked) => setSelectAll(!!checked)}
              />
              <Label htmlFor="select-all-guests">Select All</Label>
            </div>
            
            <div className="flex space-x-2">
              {activeTab === "available" ? (
                <Button 
                  variant="outline" 
                  onClick={handleSelectAll}
                  disabled={filteredAvailableGuests.length === 0}
                  size="sm"
                >
                  Add All Filtered
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDeselectAll}
                    disabled={filteredInvitedGuests.length === 0}
                    size="sm"
                  >
                    Remove All Filtered
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={handleBulkInviteSend}
                    disabled={selectedGuestIds.length === 0}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Send Invites ({selectedGuestIds.length})
                  </Button>
                </>
              )}
            </div>
          </div>

          <TabsContent value="available" className="mt-4 space-y-2">
            <div className="max-h-[400px] overflow-y-auto border rounded-md p-2 bg-gray-50">
              {filteredAvailableGuests.length > 0 ? (
                filteredAvailableGuests.map(guest => renderGuestItem(guest, false))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No available guests found matching your filters.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invited" className="mt-4 space-y-2">
            <div className="max-h-[400px] overflow-y-auto border rounded-md p-2 bg-green-50">
              {filteredInvitedGuests.length > 0 ? (
                filteredInvitedGuests.map(guest => renderGuestItem(guest, true))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No invited guests found matching your filters.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Total Invited: {currentEventGuests.length} guests
            </p>
            <p className="text-sm text-gray-500">
              Invites Sent: {currentEventGuests.filter(eg => eg.invite_sent).length} guests
            </p>
          </div>
        </div>
      </CardContent>

      <InviteDialog 
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        eventId={event.id}
        guestIds={selectedGuestIds}
        guestCount={selectedGuestIds.length}
      />
    </Card>
  );
};

export default EventGuestManager;
