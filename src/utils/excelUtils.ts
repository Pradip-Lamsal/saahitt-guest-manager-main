import * as XLSX from 'xlsx';
import { NewGuest } from '@/types/guest';
import { CustomField, CustomFieldType } from '@/types/custom-field';
import { supabase } from '@/integrations/supabase/client';
import { mapStatusToRsvp } from '@/utils/rsvpMapper';

export const generateGuestTemplate = async () => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }
    
    // Fetch custom fields directly from Supabase to include in the template
    const { data: customFieldsData, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });
    
    let customFieldHeaders: string[] = [];
    
    if (!error && customFieldsData && customFieldsData.length > 0) {
      // Properly cast the field_type to CustomFieldType
      const customFields: CustomField[] = customFieldsData.map(field => ({
        ...field,
        field_type: field.field_type as CustomFieldType,
        options: field.options as string[] || []
      }));
      
      customFieldHeaders = customFields.map((field: CustomField) => `${field.name} (Custom)`);
    }
    
    const headers = [
      'First Name*',
      'Last Name',
      'Email',
      'Phone',
      'Category',
      'Priority',
      'Status',
      'Notes',
      ...customFieldHeaders
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
    
    // Generate and download the file
    XLSX.writeFile(workbook, 'guest_template.xlsx');
  } catch (error) {
    console.error("Error generating template:", error);
    // Fallback to basic template if API call or authentication fails
    const headers = [
      'First Name*',
      'Last Name',
      'Email',
      'Phone',
      'Category',
      'Priority',
      'Status',
      'Notes'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
    
    // Generate and download the file
    XLSX.writeFile(workbook, 'guest_template.xlsx');
  }
};

export const parseGuestFile = async (file: File): Promise<NewGuest[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  // Get custom field headers (those ending with " (Custom)")
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
  const customFieldHeaders = headers.filter(header => 
    typeof header === 'string' && header.endsWith(" (Custom)")
  );

  return data.map(row => {
    // Extract custom values
    const custom_values: Record<string, any> = {};
    
    customFieldHeaders.forEach(header => {
      const fieldName = header.replace(" (Custom)", "");
      if (row[header] !== undefined) {
        custom_values[fieldName] = row[header];
      }
    });

    const status = (row['Status'] || 'Pending') as 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending';

    return {
      user_id: '', // Will be set by the component
      first_name: row['First Name*'] || '',
      last_name: row['Last Name'] || '',
      email: row['Email'] || '',
      phone: row['Phone'] || '',
      category: row['Category'] || 'Others',
      priority: (row['Priority'] || 'Medium') as 'High' | 'Medium' | 'Low',
      status: status,
      notes: row['Notes'] || '',
      custom_values,
      rsvp_status: mapStatusToRsvp(status)
    };
  });
};

export const exportGuestsToExcel = (guests: any[], customFields: CustomField[] = []) => {
  // Create headers including custom fields
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Category',
    'Priority',
    'Status',
    'Notes',
    ...customFields.map(field => field.name)
  ];
  
  // Create data rows
  const data = guests.map(guest => {
    const row: any = {
      'First Name': guest.first_name,
      'Last Name': guest.last_name || '',
      'Email': guest.email || '',
      'Phone': guest.phone || '',
      'Category': guest.category || 'Others',
      'Priority': guest.priority || 'Medium',
      'Status': guest.status || 'Pending',
      'Notes': guest.notes || ''
    };
    
    // Add custom field values
    customFields.forEach(field => {
      row[field.name] = guest.custom_values?.[field.name] || '';
    });
    
    return row;
  });
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
  
  // Generate and download file
  XLSX.writeFile(workbook, 'guest_list.xlsx');
};
