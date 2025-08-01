
export type RsvpStatus = 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending' | 'accepted' | 'declined' | 'pending';

export interface Guest {
  id: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending';
  notes?: string;
  created_at: string;
  updated_at: string;
  custom_values?: Record<string, any> | null;
  invited_at?: string;
  rsvp_at?: string;
  rsvp_details?: Record<string, any> | null;
  rsvp_status: RsvpStatus;
}

export type NewGuest = Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'rsvp_status'> & {
  rsvp_status?: RsvpStatus;
};
