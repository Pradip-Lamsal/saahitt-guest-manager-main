import { useEffect, useState } from "react";
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useGuestData } from "@/hooks/useGuestData";
import { useEventData } from "@/hooks/useEventData";
import { useEventGuests } from "@/hooks/useEventGuests";
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, Tooltip, PieChart, Pie } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Users, Calendar as CalendarIcon, ArrowRight, Mail, Check, Award, Clock, CalendarCheck, CalendarX, ChevronRight, Crown, BadgeCheck, Star } from "lucide-react";
import { Event } from "@/types/event";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DashboardHomeProps {
  profile: any;
  onTabChange?: (tab: string, eventId?: string) => void;
}

const DashboardHome = ({ profile, onTabChange }: DashboardHomeProps) => {
  const { toast } = useToast();
  const { guests, isLoading: loadingGuests } = useGuestData();
  const { events, isLoading: loadingEvents } = useEventData();
  const { eventGuests } = useEventGuests();
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [dateWithEvents, setDatesWithEvents] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  
  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Plan type display
  const getPlanDetails = () => {
    const planType = profile?.plan_type || "free";
    
    switch(planType) {
      case "pro":
        return {
          name: "Pro Plan",
          color: "bg-gradient-to-r from-amber-400 to-amber-600",
          icon: <Award className="h-5 w-5" />,
          limit: 500,
          features: ["Up to 500 guests", "Bulk import", "Custom categories"]
        };
      case "ultimate":
        return {
          name: "Ultimate Plan",
          color: "bg-gradient-to-r from-violet-500 to-purple-600",
          icon: <Crown className="h-5 w-5" />,
          limit: 2000,
          features: ["Up to 2,000 guests", "Smart ranking", "Event roles"]
        };
      default:
        return {
          name: "Free Plan",
          color: "bg-gradient-to-r from-green-400 to-teal-500",
          icon: <BadgeCheck className="h-5 w-5" />,
          limit: 100,
          features: ["Up to 100 guests", "Basic sorting", "PDF exports"]
        };
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const totalGuests = guests.length;
    const totalEvents = events.length;
    
    // Calculate invites sent
    let totalInvitesSent = 0;
    Object.values(eventGuests).forEach(guests => {
      guests.forEach(guest => {
        if (guest.invite_sent) totalInvitesSent++;
      });
    });

    // Calculate average guests per event
    const eventsWithGuests = Object.keys(eventGuests).length;
    const avgGuestsPerEvent = eventsWithGuests ? 
      (Object.values(eventGuests).reduce((acc, guests) => acc + guests.length, 0) / eventsWithGuests).toFixed(1) : 
      "0";

    // Calculate upcoming and past events
    const now = new Date();
    const upcomingEvents = events.filter(event => isAfter(parseISO(event.date), now)).length;
    const pastEvents = events.filter(event => isBefore(parseISO(event.date), now)).length;

    return {
      totalGuests,
      totalEvents,
      totalInvitesSent,
      avgGuestsPerEvent,
      upcomingEvents,
      pastEvents
    };
  };

  // Fetch public holidays/events
  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
        const response = await fetch(`https://date.nager.at/api/v3/publicholidays/2024/US`);
        
        if (response.ok) {
          const data = await response.json();
          setPublicEvents(data.map((holiday: any) => ({
            ...holiday,
            date: holiday.date,
            name: holiday.localName
          })));
        }
      } catch (error) {
        console.error("Failed to fetch public events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicEvents();
  }, [selectedMonth]);

  // Prepare dates with events for calendar
  useEffect(() => {
    const datesWithUserEvents = events.map(event => startOfDay(parseISO(event.date)));
    const datesWithPublicEvents = publicEvents.map(event => startOfDay(parseISO(event.date)));
    
    // Combine both arrays
    setDatesWithEvents([...datesWithUserEvents, ...datesWithPublicEvents]);
  }, [events, publicEvents]);

  // Prepare event data for event click handling
  const eventsByDate = events.reduce((acc: Record<string, Event[]>, event) => {
    const dateStr = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {});

  // Handle day click on calendar with improved event navigation
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const eventsOnDay = eventsByDate[dateStr];
    
    if (eventsOnDay?.length) {
      // If there's only one event, navigate directly to that event in the events tab
      if (eventsOnDay.length === 1 && onTabChange) {
        onTabChange("events", eventsOnDay[0].id);
        // Highlight the specific event via a toast notification
        toast({
          title: "Event Selected",
          description: `Navigating to "${eventsOnDay[0].name}" on ${format(day, 'MMMM d, yyyy')}`,
        });
      } else {
        // If multiple events, show dialog with list
        setSelectedDate(day);
        setSelectedDateEvents(eventsOnDay);
        setDateDialogOpen(true);
      }
    } else {
      // No events - inform user
      toast({
        title: "No Events",
        description: `No events scheduled for ${format(day, 'MMMM d, yyyy')}`,
        variant: "default",
      });
    }
  };

  // Fix navigation handlers to use onTabChange correctly
  const handleGuestListClick = () => {
    if (onTabChange) {
      onTabChange("guests");
    } else {
      // Fallback for direct navigation if props method fails
      window.location.hash = "guests";
    }
  };

  const handleEventsClick = () => {
    if (onTabChange) {
      onTabChange("events");
    } else {
      // Fallback for direct navigation if props method fails
      window.location.hash = "events";
    }
  };

  const handleInvitationsClick = () => {
    if (onTabChange) {
      onTabChange("guests");
      // Show a hint about invitation management
      toast({
        title: "Invitation Management",
        description: "Manage invitations through the Guest List page",
      });
    } else {
      // Fallback for direct navigation if props method fails
      window.location.hash = "guests";
      setTimeout(() => {
        toast({
          title: "Invitation Management",
          description: "Manage invitations through the Guest List page",
        });
      }, 100);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Guest status breakdown
    const guestStatusData = [
      { name: 'Confirmed', value: guests.filter(g => g.status === 'Confirmed').length },
      { name: 'Maybe', value: guests.filter(g => g.status === 'Maybe').length },
      { name: 'Pending', value: guests.filter(g => g.status === 'Pending').length },
      { name: 'Unavailable', value: guests.filter(g => g.status === 'Unavailable').length }
    ].filter(item => item.value > 0);

    const COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#F44336'];

    // Monthly event distribution
    const now = new Date();
    const monthlyEvents = Array(12).fill(0).map((_, i) => {
      const month = new Date(now.getFullYear(), i, 1);
      return {
        name: format(month, 'MMM'),
        events: events.filter(event => {
          const eventDate = parseISO(event.date);
          return eventDate.getMonth() === i && eventDate.getFullYear() === now.getFullYear();
        }).length
      };
    });

    return { guestStatusData, monthlyEvents, COLORS };
  };

  const metrics = calculateMetrics();
  const { guestStatusData, monthlyEvents, COLORS } = prepareChartData();
  const planDetails = getPlanDetails();
  
  // Add this new function to handle plans button click
  const handlePlansClick = () => {
    if (onTabChange) {
      onTabChange("plans");
    } else {
      // Fallback for direct navigation if props method fails
      window.location.hash = "plans";
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <Card className="mb-6 overflow-hidden border-none shadow-md bg-gradient-to-r from-[#FF6F00]/10 to-[#FF6F00]/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <Star className="h-6 w-6 text-yellow-500 mr-2 animate-[wave_1.5s_ease-in-out_0.5s]" />
                <h1 className="text-2xl font-bold text-gray-800">
                  {getGreeting()}, {profile?.first_name}!
                </h1>
              </div>
              <p className="text-gray-600">
                Welcome to your event planning dashboard. Here's an overview of your activities.
              </p>
            </div>
            <div>
              <Badge className={`px-3 py-1 ${planDetails.color} text-white`}>
                <div className="flex items-center">
                  {planDetails.icon}
                  <span className="ml-1">{planDetails.name}</span>
                </div>  
              </Badge>
              {profile?.plan_type === 'free' && (
                <div className="mt-2">
                  <Link to="/pricing">
                    <Button variant="outline" size="sm" className="text-xs">
                      Upgrade Plan
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Guest Usage */}
        <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Guest Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Guests</span>
                <span className="font-semibold">{metrics.totalGuests}</span>
              </div>
              <Progress
                value={(metrics.totalGuests / planDetails.limit) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {metrics.totalGuests} of {planDetails.limit} guests ({((metrics.totalGuests / planDetails.limit) * 100).toFixed(1)}%)
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600" 
              onClick={handleGuestListClick}
            >
              View Guest List
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Event Stats */}
        <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
              Event Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <CalendarCheck className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-purple-800 text-xs">Upcoming</span>
                </div>
                <p className="text-xl font-bold text-purple-700">{metrics.upcomingEvents}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <CalendarX className="h-4 w-4 text-gray-600 mr-1" />
                  <span className="text-gray-800 text-xs">Past</span>
                </div>
                <p className="text-xl font-bold text-gray-700">{metrics.pastEvents}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600" 
              onClick={handleEventsClick}
            >
              Manage Events
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Invitation Stats */}
        <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Mail className="h-5 w-5 mr-2 text-amber-500" />
              Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Invites Sent</span>
                <Badge variant="outline" className="bg-amber-50">
                  <Check className="h-3 w-3 mr-1 text-amber-500" />
                  <span>{metrics.totalInvitesSent}</span>
                </Badge>
              </div>
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-amber-600 mr-1" />
                  <span className="text-amber-800 text-xs">Avg. Guests per Event</span>
                </div>
                <p className="text-xl font-bold text-amber-700">{metrics.avgGuestsPerEvent}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-600" 
              onClick={handleInvitationsClick}
            >
              Manage Invitations
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Calendar and Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Card */}
        <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-[#FF6F00]" />
              Event Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="calendar-container relative">
              <Calendar
                mode="single"
                selected={selectedDate || new Date()}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                className="rounded-md border p-2 mx-auto pointer-events-auto"
                modifiers={{
                  eventDay: dateWithEvents,
                }}
                modifiersStyles={{
                  eventDay: {
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 111, 0, 0.1)',
                  }
                }}
                onDayClick={handleDayClick}
                disabled={(date) => {
                  // Disable past dates that aren't event dates
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isEventDate = !!eventsByDate[dateStr];
                  return isBefore(date, startOfDay(new Date())) && !isEventDate;
                }}
              />
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FF6F00]/20 mr-1"></div>
                  <span>Your Events</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-200 mr-1"></div>
                  <span>Public Holidays</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-200 mr-1"></div>
                  <span>Past Events</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <div className="grid grid-rows-2 gap-6">
          {/* Guest Status Chart */}
          <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-teal-500" />
                Guest Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loadingGuests ? (
                <div className="h-[140px] w-full flex items-center justify-center">
                  <Skeleton className="h-[140px] w-[140px] rounded-full" />
                </div>
              ) : guestStatusData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No guest data available yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    asChild
                  >
                    <Link to="/guests">Add Guests</Link>
                  </Button>
                </div>
              ) : (
                <div className="w-full h-[140px] flex items-center">
                  <ResponsiveContainer width="60%" height={140}>
                    <PieChart>
                      <Pie
                        data={guestStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {guestStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-[40%] text-xs space-y-1">
                    {guestStatusData.map((entry, index) => (
                      <div key={`legend-${index}`} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Events Chart */}
          <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Monthly Event Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="h-[140px] w-full flex items-center justify-center">
                  <Skeleton className="h-[140px] w-full" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No event data available yet</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    asChild
                  >
                    <Link to="/events">Add Events</Link>
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={monthlyEvents}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 'dataMax + 1']}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      formatter={(value) => [`${value} events`, 'Events']}
                    />
                    <Bar dataKey="events" radius={[4, 4, 0, 0]}>
                      {monthlyEvents.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.events > 0 ? 'rgba(79, 70, 229, 0.8)' : 'rgba(79, 70, 229, 0.2)'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Upgrade Plan Banner */}
      {profile?.plan_type === 'free' && (
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Ready to unlock more features?</h3>
                <p className="text-indigo-700 text-sm max-w-md">
                  Upgrade to Pro or Ultimate plan for bulk imports, custom categories, 
                  and advanced guest management tools.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200"
                  onClick={handlePlansClick}
                >
                  View Plans
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handlePlansClick}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Events on Selected Date Dialog */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && `Events on ${format(selectedDate, 'MMMM d, yyyy')}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{event.name}</h3>
                          {event.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setDateDialogOpen(false);
                            if (onTabChange) {
                              onTabChange("events", event.id);
                              // Highlight the specific event
                            } else {
                              // Direct navigation fallback
                              window.location.hash = "events";
                              // Store the selected event ID in localStorage to be used by the events page
                              localStorage.setItem('selectedEventId', event.id);
                              setTimeout(() => {
                                toast({
                                  title: "Event Selected",
                                  description: `You selected "${event.name}"`,
                                });
                              }, 100);
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No events found for this date.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHome;
