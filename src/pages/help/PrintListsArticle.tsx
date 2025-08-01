
import HelpArticleLayout from "@/components/help/HelpArticleLayout";
import { Printer, FileCheck, Download, FileText, CheckCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const PrintListsArticle = () => {
  return (
    <HelpArticleLayout 
      title="Generating printable guest lists"
      category="Guest Management"
      categoryLink="/help/guest-management"
      lastUpdated="1 week ago"
    >
      <p>
        Saahitt Guest Manager makes it easy to create professional, printable guest lists for your events.
        Whether you need a check-in sheet, a seating chart reference, or a complete guest directory,
        our export tools have you covered.
      </p>

      <h2>Available Export Formats</h2>
      <p>
        You can export your guest list in the following formats:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
          <FileText className="h-12 w-12 text-[#FF6F00] mb-2" />
          <h3 className="font-medium mb-1">PDF Format</h3>
          <p className="text-sm text-gray-600">
            Perfect for printing, professional-looking documents with your branding.
            Available on all plans.
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
          <Download className="h-12 w-12 text-[#FF6F00] mb-2" />
          <h3 className="font-medium mb-1">Excel/CSV Format</h3>
          <p className="text-sm text-gray-600">
            Ideal for further customization or importing into other systems.
            Available on Advanced and Ultimate plans.
          </p>
        </div>
      </div>

      <h2>Creating a Basic Printable Guest List</h2>
      <p>
        To generate a simple guest list for printing:
      </p>

      <ol>
        <li>Go to the <strong>Guests</strong> tab in your dashboard</li>
        <li>Apply any filters you want (e.g., only &quot;Confirmed&quot; guests or a specific category)</li>
        <li>Click the <strong>Export</strong> button</li>
        <li>Select <strong>PDF</strong> as the format</li>
        <li>Choose <strong>Basic List</strong> as the template</li>
        <li>Click <strong>Generate PDF</strong></li>
        <li>Once generated, you can preview, download, or print directly</li>
      </ol>

      <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium">Basic Guest List PDF Example</h3>
        </div>
        <div className="p-4">
          <img 
            src="/placeholder.svg" 
            alt="Basic Guest List PDF" 
            className="w-full rounded border border-gray-200" 
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            A sample of the Basic List PDF format
          </p>
        </div>
      </div>

      <h2>Customizing Your Guest List Export</h2>
      <p>
        You can customize your exported guest list in several ways:
      </p>

      <h3>Select Columns to Include</h3>
      <p>
        When exporting, you can choose which information to include:
      </p>
      <ul>
        <li>Name (always included)</li>
        <li>Contact information (phone, email)</li>
        <li>Category</li>
        <li>Priority level</li>
        <li>RSVP status</li>
        <li>Plus-ones/Group size</li>
        <li>Notes</li>
        <li>Custom fields</li>
      </ul>

      <h3>Choose a Template</h3>
      <p>
        Several PDF templates are available to suit different needs:
      </p>
      <ul>
        <li><strong>Basic List:</strong> Simple list format with key details</li>
        <li><strong>Check-in Sheet:</strong> Includes a column for marking attendance</li>
        <li><strong>Table Assignments:</strong> Groups guests by assigned tables</li>
        <li><strong>Detailed Directory:</strong> Comprehensive information for each guest</li>
        <li><strong>Custom Template:</strong> Available on Ultimate plan</li>
      </ul>

      <div className="flex items-start bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-green-800">Pro Tip</h3>
          <p className="text-green-700">
            When printing check-in sheets, consider exporting multiple versions: one sorted alphabetically by name,
            and another sorted by table or category. This gives you flexibility on the day of the event.
          </p>
        </div>
      </div>

      <h2>Adding Your Branding</h2>
      <p>
        With Advanced and Ultimate plans, you can customize the PDF with your branding:
      </p>

      <ol>
        <li>Go to <strong>Settings {`>`} Branding</strong></li>
        <li>Upload your logo</li>
        <li>Select brand colors</li>
        <li>Add a custom header or footer</li>
        <li>Save your branding settings</li>
        <li>When exporting, check the &quot;Include branding&quot; option</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="sm:w-1/4 flex justify-center">
          <Settings className="h-16 w-16 text-[#FF6F00]" />
        </div>
        <div className="sm:w-3/4">
          <h3 className="text-lg font-medium mb-2">Advanced Customization</h3>
          <p>
            Ultimate plan subscribers can create fully custom templates with their own layouts,
            fonts, and design elements. Contact our support team to learn more about setting up
            custom PDF templates for your organization.
          </p>
        </div>
      </div>

      <h2>Exporting for Specific Purposes</h2>

      <h3>For Event Check-in</h3>
      <p>
        When creating a check-in list for your event staff:
      </p>
      <ol>
        <li>Filter your guest list to show only confirmed guests</li>
        <li>Export as PDF using the &quot;Check-in Sheet&quot; template</li>
        <li>Include columns for Name, Category, and Plus-ones</li>
        <li>Sort alphabetically by last name</li>
      </ol>

      <h3>For Catering or Venue Staff</h3>
      <p>
        When sharing information with vendors:
      </p>
      <ol>
        <li>Export as PDF using the &quot;Basic List&quot; template</li>
        <li>Include only necessary details (avoid sharing personal contact information)</li>
        <li>Focus on headcount, dietary restrictions, and special accommodations</li>
      </ol>

      <h3>For Your Personal Reference</h3>
      <p>
        When creating a comprehensive reference for yourself:
      </p>
      <ol>
        <li>Export as PDF using the &quot;Detailed Directory&quot; template</li>
        <li>Include all guest details</li>
        <li>Consider organizing by category or table assignment</li>
      </ol>

      <h2>Exporting to Excel/CSV</h2>
      <p>
        For Advanced and Ultimate plan subscribers, exporting to Excel or CSV offers additional flexibility:
      </p>

      <ol>
        <li>Go to the <strong>Guests</strong> tab</li>
        <li>Apply any desired filters</li>
        <li>Click the <strong>Export</strong> button</li>
        <li>Select <strong>Excel/CSV</strong> as the format</li>
        <li>Choose which columns to include</li>
        <li>Click <strong>Export</strong></li>
        <li>Open the file in Excel or another spreadsheet program for further customization</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="sm:w-1/4 flex justify-center">
          <FileCheck className="h-16 w-16 text-[#FF6F00]" />
        </div>
        <div className="sm:w-3/4">
          <h3 className="text-lg font-medium mb-2">Excel Templates</h3>
          <p>
            For Ultimate plan users, we provide pre-designed Excel templates that automatically format
            your exported data with charts, filters, and print-ready layouts. Access these templates
            in the Export menu.
          </p>
        </div>
      </div>

      <h2>Printing Tips</h2>
      <p>
        For best results when printing your guest lists:
      </p>

      <ul>
        <li><strong>Paper Size:</strong> Our PDFs are optimized for standard letter size (8.5&quot; x 11&quot;) or A4 paper</li>
        <li><strong>Orientation:</strong> Choose landscape orientation for lists with many columns</li>
        <li><strong>Print Quality:</strong> Select &quot;High Quality&quot; in your printer settings for best results</li>
        <li><strong>Test Print:</strong> Always print a test page first to check alignment and readability</li>
        <li><strong>Consider Color Coding:</strong> Ultimate plan users can include color-coded categories</li>
      </ul>

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
          <Link to="/help/article/guest-categories" className="text-[#FF6F00] hover:underline">
            Setting up categories for your guest list
          </Link>
        </li>
        <li>
          <Link to="/help/article/track-rsvps" className="text-[#FF6F00] hover:underline">
            Tracking RSVPs and responses
          </Link>
        </li>
      </ul>
    </HelpArticleLayout>
  );
};

export default PrintListsArticle;
