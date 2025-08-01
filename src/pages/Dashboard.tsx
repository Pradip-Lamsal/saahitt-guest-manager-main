/* eslint-disable @typescript-eslint/no-explicit-any */
import AddCategoryForm from "@/components/categories/AddCategoryForm";
import CategoryList from "@/components/categories/CategoryList";
import DashboardHome from "@/components/dashboard/DashboardHome";
import PlanManagementView from "@/components/dashboard/PlanManagementView";
import AddEventForm from "@/components/events/AddEventForm";
import EventList from "@/components/events/EventList";
import AddGuestForm from "@/components/guests/AddGuestForm";
import BulkImportDialog from "@/components/guests/BulkImportDialog";
import GuestList from "@/components/guests/GuestList";
import AccountSettings from "@/components/settings/AccountSettings";
import CustomFieldsManager from "@/components/settings/CustomFieldsManager";
import { PlanManagement } from "@/components/settings/PlanManagement";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart4,
  CalendarDays,
  CreditCard,
  Download,
  ListFilter,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface EventListProps {
  selectedEventId: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [guestFormOpen, setGuestFormOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [settingsSubView, setSettingsSubView] = useState("account");

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const validTabs = [
      "home",
      "guests",
      "categories",
      "events",
      "settings",
      "plans",
    ];

    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);

      if (hash === "settings" && location.search) {
        const params = new URLSearchParams(location.search);
        const view = params.get("view");
        if (view && ["account", "plans", "fields"].includes(view)) {
          setSettingsSubView(view);
        }
      }
    }

    const storedEventId = localStorage.getItem("selectedEventId");
    if (storedEventId) {
      setSelectedEventId(storedEventId);
      localStorage.removeItem("selectedEventId");
    }
  }, [location]);

  useEffect(() => {
    checkUser();
    getProfile();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please sign in again",
      });
      navigate("/auth");
    }
  };

  const getProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error fetching profile",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleTabChange = (value: string, eventId?: string) => {
    setActiveTab(value);

    if (value !== "settings") {
      setSettingsSubView("account");
    }

    if (eventId) {
      setSelectedEventId(eventId);
      setTimeout(() => {
        const eventElement = document.getElementById(`event-${eventId}`);
        if (eventElement) {
          eventElement.scrollIntoView({ behavior: "smooth" });
          eventElement.classList.add("highlight-event");
          setTimeout(() => {
            eventElement.classList.remove("highlight-event");
          }, 2000);
        }
      }, 100);
    }
  };

  const handleSettingsSubViewChange = (view: string) => {
    setSettingsSubView(view);
    window.history.replaceState(null, "", `#settings?view=${view}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="https://saahitt.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmain-logo.0a76fcc4.png&w=640&q=75"
                alt="Saahitt Logo"
                className="h-8 w-auto mr-8"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {profile?.first_name}!
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="bg-white p-1 space-x-2">
            <TabsTrigger value="home" className="space-x-2">
              <BarChart4 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="space-x-2">
              <Users className="h-4 w-4" />
              <span>Guest List</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="space-x-2">
              <ListFilter className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Plans</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <DashboardHome profile={profile} onTabChange={handleTabChange} />
          </TabsContent>

          <TabsContent value="guests">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Guest List</h2>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Bulk Import
                      </Button>
                    </DialogTrigger>
                    <BulkImportDialog
                      open={bulkImportOpen}
                      onOpenChange={setBulkImportOpen}
                    />
                  </Dialog>
                  <Dialog open={guestFormOpen} onOpenChange={setGuestFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Guest
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <AddGuestForm
                        onSuccess={() => {
                          setGuestFormOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <GuestList />
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Categories</h2>
                <Dialog
                  open={categoryFormOpen}
                  onOpenChange={setCategoryFormOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <AddCategoryForm
                      onSuccess={() => {
                        setCategoryFormOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <CategoryList />
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Events</h2>
                <Dialog open={eventFormOpen} onOpenChange={setEventFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <AddEventForm
                      onSuccess={() => {
                        setEventFormOpen(false);
                        setActiveTab("events");
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <EventList selectedEventId={selectedEventId} />
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Plans & Pricing</h2>
              </div>
              <PlanManagementView
                profile={profile}
                onRefreshProfile={getProfile}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-6 p-1">
                <h2 className="text-2xl font-bold">Settings</h2>

                <div className="flex border-b pb-2 mb-6">
                  <button
                    className={`px-4 py-2 ${
                      settingsSubView === "account"
                        ? "border-b-2 border-[#FF6F00] text-[#FF6F00]"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleSettingsSubViewChange("account")}
                  >
                    Account
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      settingsSubView === "plans"
                        ? "border-b-2 border-[#FF6F00] text-[#FF6F00]"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleSettingsSubViewChange("plans")}
                  >
                    Plan Management
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      settingsSubView === "fields"
                        ? "border-b-2 border-[#FF6F00] text-[#FF6F00]"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleSettingsSubViewChange("fields")}
                  >
                    Custom Fields
                  </button>
                </div>

                <div className="grid gap-6">
                  {settingsSubView === "account" && <AccountSettings />}

                  {settingsSubView === "plans" && <PlanManagement />}

                  {settingsSubView === "fields" && <CustomFieldsManager />}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <style>
        {`
        .highlight-event {
          animation: highlight 2s ease-in-out;
        }
        
        @keyframes highlight {
          0%, 100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(255, 111, 0, 0.2);
          }
        }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
