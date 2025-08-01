
import { RsvpStatus } from "@/types/guest";

export const mapStatusToRsvp = (status: string | undefined): RsvpStatus => {
  if (!status) return 'Pending';
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'confirmed':
    case 'accepted':
      return 'accepted';
    case 'maybe':
      return 'Maybe';
    case 'unavailable':
    case 'declined':
      return 'declined';
    default:
      return 'pending';
  }
};
