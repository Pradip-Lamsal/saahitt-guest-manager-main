
import HelpArticleLayout from "@/components/help/HelpArticleLayout";
import { ClipboardCheck, Mailbox, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const TrackRSVPsArticle = () => {
  return (
    <HelpArticleLayout 
      title="Tracking RSVPs and responses"
      category="Guest Management"
      categoryLink="/help/guest-management"
      lastUpdated="3 weeks ago"
    >
      <p>
        Keeping track of who's attending your event is crucial for planning. Saahitt Guest Manager 
        makes it easy to track RSVPs and guest responses in one centralized place.
      </p>

      <h2>RSVP Statuses Explained</h2>
      <p>
        Saahitt Guest Manager uses the following RSVP statuses to track guest responses:
      </p>

      <ul>
        <li><strong>Awaiting Response:</strong> The default status for guests who have not yet responded</li>
        <li><strong>Confirmed:</strong> Guests who have confirmed they will attend</li>
        <li><strong>Maybe:</strong> Guests who might attend but haven't made a final decision</li>
        <li><strong>Declined:</strong> Guests who have declined the invitation</li>
        <li><strong>No Contact:</strong> Guests who haven't been invited yet or couldn't be reached</li>
      </ul>

      <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium">RSVP Status Indicators</h3>
        </div>
        <div className="p-4">
          <img 
            src="/placeholder.svg" 
            alt="RSVP Status Indicators" 
            className="w-full rounded border border-gray-200" 
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            Visual indicators for different RSVP statuses in the guest list
          </p>
        </div>
      </div>

      <h2>Updating RSVP Status Manually</h2>
      <p>
        There are several ways to update a guest's RSVP status manually:
      </p>

      <h3>From the Guest List:</h3>
      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Find the guest whose status you want to update</li>
        <li>Click on the current RSVP status in their row</li>
        <li>Select the new status from the dropdown menu</li>
        <li>The change is saved automatically</li>
      </ol>

      <h3>From Guest Details:</h3>
      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Click on the guest's name to open their details</li>
        <li>In the details panel, click <strong>Edit</strong></li>
        <li>Update the RSVP Status field</li>
        <li>Click <strong>Save</strong> to apply the change</li>
      </ol>

      <h3>Bulk Update:</h3>
      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Select multiple guests by checking the boxes next to their names</li>
        <li>Click the <strong>Actions</strong> dropdown</li>
        <li>Select <strong>Update RSVP Status</strong></li>
        <li>Choose the new status from the popup</li>
        <li>Click <strong>Apply</strong> to update all selected guests</li>
      </ol>

      <div className="flex items-start bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-yellow-800">Important</h3>
          <p className="text-yellow-700">
            When updating RSVP statuses manually, it's a good practice to add a note with the date 
            and method of confirmation (e.g., "Confirmed by phone on July 15"). This helps you keep track 
            of how and when the guest responded.
          </p>
        </div>
      </div>

      <h2>Tracking Plus-Ones and Group Sizes</h2>
      <p>
        For guests who are bringing additional attendees:
      </p>

      <ol>
        <li>When updating a guest's RSVP status, check if they've indicated plus-ones</li>
        <li>Edit the guest details and update the <strong>Plus Ones</strong> field with the number of additional guests</li>
        <li>Optionally, add the names of accompanying guests in the notes field</li>
        <li>The total headcount will automatically update in your event dashboard</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="sm:w-1/4 flex justify-center">
          <Mailbox className="h-16 w-16 text-[#FF6F00]" />
        </div>
        <div className="sm:w-3/4">
          <h3 className="text-lg font-medium mb-2">Premium Feature: Digital RSVP Tracking</h3>
          <p>
            With our Advanced and Ultimate plans, you can send digital invitations and collect RSVPs automatically. 
            Guests receive an email or WhatsApp message with a link to respond, and their status updates automatically 
            in your dashboard.
          </p>
          <Link to="/pricing" className="text-[#FF6F00] hover:underline mt-2 inline-block">
            Upgrade to unlock digital RSVPs →
          </Link>
        </div>
      </div>

      <h2>Filtering and Viewing RSVP Data</h2>
      <p>
        To get an overview of your RSVP statuses:
      </p>

      <h3>Using Filters:</h3>
      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Click the <strong>Filter</strong> button</li>
        <li>Select one or more RSVP statuses to filter by</li>
        <li>Your guest list will update to show only guests with the selected statuses</li>
      </ol>

      <h3>RSVP Summary Dashboard:</h3>
      <ol>
        <li>Go to your event's <strong>Dashboard</strong></li>
        <li>View the RSVP summary card showing counts for each status</li>
        <li>Click on any status to see a filtered list of guests with that status</li>
      </ol>

      <div className="flex items-start bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-green-800">Pro Tip</h3>
          <p className="text-green-700">
            Set up custom views to quickly access commonly used filters. For example, create a
            "Pending RSVPs" view to show all guests with "Awaiting Response" status, or a
            "Confirmed Attendees" view to see everyone who has confirmed.
          </p>
        </div>
      </div>

      <h2>Setting RSVP Deadlines</h2>
      <p>
        To help manage your timeline effectively:
      </p>

      <ol>
        <li>Go to your event settings</li>
        <li>Set an <strong>RSVP Deadline</strong> date</li>
        <li>The system will highlight overdue responses after this date</li>
        <li>With premium plans, automatic reminders can be sent as the deadline approaches</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="sm:w-1/4 flex justify-center">
          <Bell className="h-16 w-16 text-[#FF6F00]" />
        </div>
        <div className="sm:w-3/4">
          <h3 className="text-lg font-medium mb-2">Setting Up RSVP Reminders</h3>
          <p>
            With our Ultimate plan, you can schedule automatic reminders for guests who haven't 
            responded. Set up reminder emails or messages to be sent at specified intervals 
            before your RSVP deadline.
          </p>
        </div>
      </div>

      <h2>Exporting RSVP Data</h2>
      <p>
        To use your RSVP data outside of Saahitt Guest Manager:
      </p>

      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Apply any filters you want (e.g., only "Confirmed" guests)</li>
        <li>Click the <strong>Export</strong> button</li>
        <li>Choose your preferred format (PDF or Excel/CSV)</li>
        <li>The export will include RSVP status, plus-ones, and other guest details</li>
      </ol>

      <h2>Best Practices for RSVP Management</h2>

      <ul>
        <li><strong>Set clear deadlines:</strong> Give guests enough time to respond, but not so much that they forget</li>
        <li><strong>Follow up:</strong> Contact guests who haven't responded as the deadline approaches</li>
        <li><strong>Keep records:</strong> Note how and when guests confirm (phone, email, in person)</li>
        <li><strong>Update regularly:</strong> Make it a habit to update RSVP statuses as soon as you hear from guests</li>
        <li><strong>Plan for no-shows:</strong> Even with confirmed guests, expect some no-shows (typically 5-10%)</li>
      </ul>

      <h2>Related Articles</h2>
      <p>
        To learn more about managing your guests, check out these related articles:
      </p>
      <ul>
        <li>
          <Link to="/help/article/import-guests" className="text-[#FF6F00] hover:underline">
            How to import guests from a spreadsheet
          </Link>
        </li>
        <li>
          <Link to="/help/article/guest-categories" className="text-[#FF6F00] hover:underline">
            Setting up categories for your guest list
          </Link>
        </li>
        <li>
          <Link to="/help/article/print-lists" className="text-[#FF6F00] hover:underline">
            Generating printable guest lists
          </Link>
        </li>
      </ul>
    </HelpArticleLayout>
  );
};

export default TrackRSVPsArticle;
