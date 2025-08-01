
import HelpArticleLayout from "@/components/help/HelpArticleLayout";
import { Tag, ListFilter, Info, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const GuestCategoriesArticle = () => {
  return (
    <HelpArticleLayout 
      title="Setting up categories for your guest list"
      category="Guest Management"
      categoryLink="/help/guest-management"
      lastUpdated="2 weeks ago"
    >
      <p>
        Organizing your guests into categories helps you manage your event more efficiently.
        This guide will show you how to create, edit, and use categories in Saahitt Guest Manager.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <Info className="h-6 w-6 text-blue-500 mr-3 shrink-0" />
          <p>
            <strong>Note:</strong> Custom categories are available on all plans, including the free plan.
          </p>
        </div>
      </div>

      <h2>Why categorize your guests?</h2>
      <p>Categorizing your guests offers several benefits:</p>
      <ul>
        <li>Easily filter and view specific groups of guests</li>
        <li>Assign different priorities or seating arrangements based on categories</li>
        <li>Send targeted communications to specific groups</li>
        <li>Generate reports and statistics by category</li>
        <li>Manage your guest list more efficiently</li>
      </ul>

      <h2>Default Categories</h2>
      <p>
        Saahitt Guest Manager comes with several default categories to help you get started:
      </p>
      <ul>
        <li><strong>Family:</strong> Close relatives and family members</li>
        <li><strong>Friends:</strong> Personal friends and acquaintances</li>
        <li><strong>Colleagues:</strong> Work associates and professional contacts</li>
        <li><strong>VIP:</strong> Very important guests who require special attention</li>
      </ul>

      <h2>Creating Custom Categories</h2>
      <p>To create your own custom categories:</p>

      <ol>
        <li>Log in to your Saahitt Guest Manager account</li>
        <li>Navigate to the <strong>Settings</strong> tab</li>
        <li>Select <strong>Categories</strong> from the settings menu</li>
        <li>Click the <strong>Add Category</strong> button</li>
        <li>Enter a name for your new category</li>
        <li>Choose a color (optional) for visual identification</li>
        <li>Add a description (optional) to clarify the category&apos;s purpose</li>
        <li>Click <strong>Save</strong> to create the category</li>
      </ol>

      <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium">Category Management Screen</h3>
        </div>
        <div className="p-4">
          <img 
            src="/placeholder.svg" 
            alt="Category Management Screen" 
            className="w-full rounded border border-gray-200" 
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            The Categories management screen in the Settings area
          </p>
        </div>
      </div>

      <h2>Assigning Categories to Guests</h2>
      <p>There are several ways to assign categories to your guests:</p>

      <h3>When adding a new guest:</h3>
      <ol>
        <li>Click <strong>Add Guest</strong> in the Guests tab</li>
        <li>Fill in the guest details</li>
        <li>Select a category from the dropdown menu</li>
        <li>Click <strong>Save</strong> to add the guest with the assigned category</li>
      </ol>

      <h3>For existing guests:</h3>
      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Click on the guest&apos;s name to open their details</li>
        <li>Click <strong>Edit</strong></li>
        <li>Update the category field</li>
        <li>Click <strong>Save</strong> to update the guest</li>
      </ol>

      <h3>Bulk assigning categories:</h3>
      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Select multiple guests by checking the boxes next to their names</li>
        <li>Click the <strong>Actions</strong> dropdown</li>
        <li>Select <strong>Assign Category</strong></li>
        <li>Choose the category from the popup</li>
        <li>Click <strong>Apply</strong> to update all selected guests</li>
      </ol>

      <div className="flex items-start bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-green-800">Pro Tip</h3>
          <p className="text-green-700">
            You can assign multiple categories to a single guest! This is useful for guests who fit into 
            more than one group, such as someone who is both a family member and a colleague.
          </p>
        </div>
      </div>

      <h2>Filtering Guests by Category</h2>
      <p>
        Once you&apos;ve assigned categories to your guests, you can easily filter your guest list:
      </p>

      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Click on the <strong>Filter</strong> button</li>
        <li>Select one or more categories from the dropdown</li>
        <li>Your guest list will update to show only guests in the selected categories</li>
        <li>To clear filters, click <strong>Clear All</strong> in the filter menu</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="sm:w-1/4 flex justify-center">
          <ListFilter className="h-16 w-16 text-[#FF6F00]" />
        </div>
        <div className="sm:w-3/4">
          <h3 className="text-lg font-medium mb-2">Filtering in Action</h3>
          <p>
            Filters can be combined with other criteria such as RSVP status and priority.
            For example, you could filter to show all &quot;Family&quot; category guests who have 
            &quot;Confirmed&quot; their attendance.
          </p>
        </div>
      </div>

      <h2>Editing and Deleting Categories</h2>
      <p>You can modify your categories at any time:</p>

      <h3>To edit a category:</h3>
      <ol>
        <li>Go to <strong>Settings {`>`} Categories</strong></li>
        <li>Find the category you want to edit</li>
        <li>Click the <strong>Edit</strong> icon</li>
        <li>Make your changes</li>
        <li>Click <strong>Save</strong></li>
      </ol>

      <h3>To delete a category:</h3>
      <ol>
        <li>Go to <strong>Settings {`>`} Categories</strong></li>
        <li>Find the category you want to delete</li>
        <li>Click the <strong>Delete</strong> icon</li>
        <li>Confirm the deletion when prompted</li>
      </ol>

      <p>
        <strong>Note:</strong> Deleting a category will not delete the guests in that category. 
        Those guests will simply no longer have a category assigned to them.
      </p>

      <h2>Related Articles</h2>
      <p>
        To learn more about managing your guest list, check out these related articles:
      </p>
      <ul>
        <li>
          <Link to="/help/article/import-guests" className="text-[#FF6F00] hover:underline">
            How to import guests from a spreadsheet
          </Link>
        </li>
        <li>
          <Link to="/help/article/track-rsvps" className="text-[#FF6F00] hover:underline">
            Tracking RSVPs and responses
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

export default GuestCategoriesArticle;
