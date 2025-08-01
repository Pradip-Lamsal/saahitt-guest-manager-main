
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarDays, CheckCircle, ArrowLeft } from 'lucide-react';

interface RSVPData {
  guest: {
    id: string;
    name: string;
    email?: string;
    rsvpStatus?: string;
    rsvpDetails?: any;
  };
  event: {
    id: string;
    name: string;
    date: string;
    description?: string;
  };
  token: string;
}

const RSVP = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [data, setData] = useState<RSVPData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const fetchRSVPData = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          setError('Invalid invitation link');
          setLoading(false);
          return;
        }
        
        // Call the rsvp endpoint to get guest and event data
        const { data, error } = await supabase.functions.invoke(`rsvp/${token}`);
        
        if (error) {
          console.error('Error fetching RSVP data:', error);
          setError(error.message || 'Error loading invitation');
          setLoading(false);
          return;
        }
        
        setData(data);
        
        // Pre-fill form if there's existing RSVP data
        if (data.guest.rsvpStatus === 'accepted') {
          setAttending(true);
          if (data.guest.rsvpDetails?.guestsCount) {
            setGuestsCount(data.guest.rsvpDetails.guestsCount);
          }
          if (data.guest.rsvpDetails?.notes) {
            setNotes(data.guest.rsvpDetails.notes);
          }
        } else if (data.guest.rsvpStatus === 'declined') {
          setAttending(false);
          if (data.guest.rsvpDetails?.notes) {
            setNotes(data.guest.rsvpDetails.notes);
          }
        }
        
      } catch (error) {
        console.error('Error in RSVP page:', error);
        setError('Unable to load invitation details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRSVPData();
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attending === null) {
      toast({
        variant: "destructive",
        title: "Please select an option",
        description: "Please indicate whether you'll attend the event.",
      });
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      const rsvpData = {
        attending,
        guestsCount: attending ? guestsCount : 0,
        notes
      };
      
      // Call the rsvp endpoint to update attendance status
      const { data: responseData, error } = await supabase.functions.invoke(`rsvp/${token}`, {
        method: 'POST',
        body: rsvpData
      });
      
      if (error) {
        console.error('Error submitting RSVP:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to submit your RSVP",
        });
        return;
      }
      
      // Show success message
      toast({
        title: "RSVP Submitted",
        description: responseData.message || "Thank you for your response!",
      });
      
      setFormSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your RSVP. Please try again.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F00] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading invitation details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
            <CardDescription>
              We couldn't load the invitation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              This invitation link may have expired or is invalid. Please contact the event organizer for assistance.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              We couldn't find the invitation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              The invitation link appears to be invalid or has expired.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (formSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your RSVP has been successfully recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {attending ? "We look forward to seeing you there!" : "We're sorry you can't make it"}
            </h3>
            <p className="text-gray-700 mb-4">
              {attending 
                ? `You've confirmed your attendance for ${data.event.name}.` 
                : `Thank you for letting us know you can't attend ${data.event.name}.`}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                If you need to make any changes to your RSVP, please contact the event organizer.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => window.location.href = 'https://saahitt.com'}
              variant="outline"
            >
              Visit Saahitt Website
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{data.event.name}</CardTitle>
          <CardDescription className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
            {data.event.date 
              ? format(new Date(data.event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")
              : "Date to be announced"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Hello, {data.guest.name}!
                </h3>
                {data.event.description && (
                  <p className="text-gray-700 mb-4">{data.event.description}</p>
                )}
                <p className="text-gray-700">
                  Please let us know if you'll be able to attend.
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Will you attend?</Label>
                <RadioGroup 
                  value={attending === null ? undefined : attending ? "yes" : "no"} 
                  onValueChange={(value) => setAttending(value === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes, I'll be there</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No, I can't make it</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {attending && (
                <div className="space-y-3">
                  <Label htmlFor="guests">Number of guests (including yourself)</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Dietary restrictions, special requests, or any other information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#FF6F00] hover:bg-[#FF6F00]/90" 
                disabled={submitLoading || attending === null}
              >
                {submitLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit RSVP"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RSVP;
