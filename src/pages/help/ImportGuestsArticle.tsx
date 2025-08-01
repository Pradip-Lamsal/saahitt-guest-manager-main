
import HelpArticleLayout from "@/components/help/HelpArticleLayout";
import { FileSpreadsheet, Upload, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";

const ImportGuestsArticle = () => {
  return (
    <HelpArticleLayout 
      title="How to import guests from a spreadsheet"
      category="Guest Management"
      categoryLink="/help/guest-management"
      lastUpdated="2 weeks ago"
    >
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <Info className="h-6 w-6 text-blue-500 mr-3 shrink-0" />
          <p>
            <strong>Note:</strong> The import feature is available on all plans, including the free plan.
          </p>
        </div>
      </div>

      <p>
        Saahitt Guest Manager allows you to easily import your guest list from Excel or CSV files,
        saving you time and effort. This guide will walk you through the process step by step.
      </p>

      <h2>Step 1: Prepare your spreadsheet</h2>
      <p>
        Before importing, ensure your spreadsheet is correctly formatted with the following columns:
      </p>

      <ul>
        <li><strong>Name</strong> (Required): Full name of the guest</li>
        <li><strong>Email</strong> (Optional): Guest's email address</li>
        <li><strong>Phone</strong> (Optional): Contact number</li>
        <li><strong>Category</strong> (Optional): Type of guest (e.g., Family, Friend, Colleague)</li>
        <li><strong>Priority</strong> (Optional): Guest priority level (High, Medium, Low)</li>
        <li><strong>RSVP Status</strong> (Optional): Confirmed, Maybe, or Unavailable</li>
        <li><strong>Plus Ones</strong> (Optional): Number of additional guests</li>
        <li><strong>Notes</strong> (Optional): Any additional information</li>
      </ul>

      <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="flex items-center text-lg font-medium mb-2">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
          Download Template
        </h3>
        <p className="mb-3">
          Not sure how to format your spreadsheet? Download our template to get started.
        </p>
        <Link 
          to="/downloads/guest-import-template.xlsx" 
          className="inline-flex items-center text-[#FF6F00] hover:underline font-medium"
        >
          Download Excel Template
        </Link>
      </div>

      <h2>Step 2: Import your spreadsheet</h2>
      <p>Follow these steps to import your guest list:</p>

      <ol>
        <li>Log in to your Saahitt Guest Manager account</li>
        <li>Navigate to the <strong>Guests</strong> tab in your dashboard</li>
        <li>Click the <strong>Import Guests</strong> button in the top-right corner</li>
        <li>Click <strong>Choose File</strong> or drag and drop your spreadsheet</li>
        <li>Select your prepared Excel or CSV file</li>
        <li>Click <strong>Upload</strong> to begin the import process</li>
      </ol>

      <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium">Import Screen Example</h3>
        </div>
        <div className="p-4">
          <img 
            src="/placeholder.svg" 
            alt="Guest Import Screen" 
            className="w-full rounded border border-gray-200" 
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            The import screen with file selection and mapping options
          </p>
        </div>
      </div>

      <h2>Step 3: Map your columns</h2>
      <p>
        After uploading your file, you'll see the column mapping screen. Here, you'll need to match the columns in your spreadsheet with the corresponding fields in Saahitt Guest Manager.
      </p>

      <ul>
        <li>For each column in your spreadsheet, select the matching field from the dropdown</li>
        <li>If a column doesn't have corresponding data in our system, select "Do not import"</li>
        <li>Required fields (like Name) must be mapped to proceed</li>
        <li>Click <strong>Continue</strong> after mapping all columns</li>
      </ul>

      <h2>Step 4: Review and confirm</h2>
      <p>
        Before finalizing the import, you'll see a preview of the data that will be imported. 
        This gives you a chance to verify that everything is correctly mapped.
      </p>

      <ul>
        <li>Review the preview data to make sure it appears as expected</li>
        <li>Check for any warnings or errors highlighted in the preview</li>
        <li>Select whether to <strong>Skip duplicate entries</strong> or <strong>Update existing entries</strong> if duplicates are found</li>
        <li>Click <strong>Import Guests</strong> to finalize the process</li>
      </ul>

      <div className="flex items-start bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-yellow-800">Important</h3>
          <p className="text-yellow-700">
            Make sure your spreadsheet doesn't exceed the guest limit for your plan. 
            The free plan allows up to 100 guests, Advanced plan up to 300 guests, 
            and Ultimate plan offers unlimited guests.
          </p>
        </div>
      </div>

      <h2>Troubleshooting Common Issues</h2>

      <h3>File Format Problems</h3>
      <p>
        If you're having trouble uploading your file, make sure it's saved as an .xlsx, .xls, or .csv file.
        Other formats are not supported at this time.
      </p>

      <h3>Handling Duplicates</h3>
      <p>
        If you're importing guests that may already exist in your list, you have two options:
      </p>
      <ul>
        <li><strong>Skip duplicates:</strong> Any guests with the same email address or phone number will not be imported</li>
        <li><strong>Update existing:</strong> Information for existing guests will be updated with the data from your import file</li>
      </ul>

      <h3>Import Errors</h3>
      <p>
        If you encounter errors during import, check for:
      </p>
      <ul>
        <li>Special characters or formatting in your spreadsheet</li>
        <li>Missing required fields (Name is always required)</li>
        <li>Exceeding your plan's guest limit</li>
        <li>File size larger than 5MB</li>
      </ul>

      <div className="flex items-start bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-green-800">Pro Tip</h3>
          <p className="text-green-700">
            After importing guests, you can assign them to specific events from the Guests tab.
            Simply select the guests you want to add, click the "Assign to Event" button, and
            choose the event from the dropdown.
          </p>
        </div>
      </div>

      <h2>Need More Help?</h2>
      <p>
        If you're still having trouble with importing guests, our support team is here to help.
        Contact us through our <Link to="/contact" className="text-[#FF6F00] hover:underline">support page</Link> or
        email us at support@saahitt.com.
      </p>
    </HelpArticleLayout>
  );
};

export default ImportGuestsArticle;
