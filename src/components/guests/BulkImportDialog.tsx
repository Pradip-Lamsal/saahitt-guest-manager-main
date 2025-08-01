
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateGuestTemplate, parseGuestFile } from "@/utils/excelUtils";
import { useGuestData } from "@/hooks/useGuestData";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useToast } from "@/components/ui/use-toast";
import { FileSpreadsheet, Download, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BulkImportDialog: React.FC<BulkImportDialogProps> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addGuests } = useGuestData();
  const { customFields } = useCustomFields();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    await generateGuestTemplate();
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to upload",
      });
      return;
    }

    try {
      setUploading(true);

      // Parse the Excel file
      const guests = await parseGuestFile(file);

      if (guests.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No guests found in the uploaded file",
        });
        return;
      }

      // Add the parsed guests to the database
      addGuests.mutate(guests, {
        onSuccess: () => {
          setFile(null);
          onOpenChange(false);
        },
      });
    } catch (error: any) {
      console.error("Error uploading guests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload guests",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Import Guests from Excel/CSV</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        {customFields.length > 0 && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your account has {customFields.length} custom {customFields.length === 1 ? 'field' : 'fields'}.
              The template includes these fields. Make sure to fill them correctly for your guests.
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">Upload Excel/CSV File</Label>
          <Input
            id="file"
            type="file"
            accept=".xlsx,.xls,.csv,.vcf"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500">
            {file ? `Selected file: ${file.name}` : "No file selected"}
          </p>
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>Importing...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Guests
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  );
};

export default BulkImportDialog;
