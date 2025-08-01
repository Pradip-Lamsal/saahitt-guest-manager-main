
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Guest } from "@/types/guest";
import { CustomField } from "@/types/custom-field";
import { Event, EventGuest } from "@/types/event";
import { format } from "date-fns";

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  eventInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  eventDetail: {
    fontSize: 12,
    marginBottom: 3,
  },
  summary: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  summaryText: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    minHeight: 30,
    alignItems: "center",
  },
  tableHeaderRow: {
    backgroundColor: "#f0f0f0",
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: "bold",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
  },
  nameCell: {
    width: "25%",
  },
  contactCell: {
    width: "20%",
  },
  categoryCell: {
    width: "15%",
  },
  priorityCell: {
    width: "15%",
  },
  statusCell: {
    width: "15%",
  },
  customFieldCell: {
    width: "20%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: "center",
    color: "grey",
  },
  noteText: {
    fontSize: 10,
    marginTop: 2,
    color: "#666",
  },
  categoryBlock: {
    marginTop: 10,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#e8e8e8",
    padding: 5,
    borderRadius: 3,
  },
});

interface GuestListPDFProps {
  guests: Guest[];
  customFields?: CustomField[];
  event?: Event;
  eventGuests?: EventGuest[];
}

const GuestListPDF: React.FC<GuestListPDFProps> = ({ 
  guests, 
  customFields = [], 
  event,
  eventGuests = []
}) => {
  // Count guests by category
  const guestsByCategory: Record<string, Guest[]> = {};
  guests.forEach((guest) => {
    const category = guest.category || "Others";
    if (!guestsByCategory[category]) {
      guestsByCategory[category] = [];
    }
    guestsByCategory[category].push(guest);
  });

  // Count guests by status
  const statusCount: Record<string, number> = {
    Confirmed: 0,
    Maybe: 0,
    Unavailable: 0,
    Pending: 0,
  };

  guests.forEach((guest) => {
    if (guest.status) {
      statusCount[guest.status]++;
    }
  });

  // Function to render the guest table headers with custom fields
  const renderTableHeaders = () => (
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      <Text style={[styles.tableCellHeader, styles.nameCell]}>Guest Name</Text>
      <Text style={[styles.tableCellHeader, styles.contactCell]}>Contact</Text>
      <Text style={[styles.tableCellHeader, styles.categoryCell]}>Category</Text>
      <Text style={[styles.tableCellHeader, styles.priorityCell]}>Priority</Text>
      <Text style={[styles.tableCellHeader, styles.statusCell]}>Status</Text>
      {customFields.map((field) => (
        <Text key={field.id} style={[styles.tableCellHeader, styles.customFieldCell]}>
          {field.name}
        </Text>
      ))}
    </View>
  );

  // Function to render a single guest row with custom fields
  const renderGuestRow = (guest: Guest) => (
    <View key={guest.id} style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.nameCell]}>
        {guest.first_name} {guest.last_name}
      </Text>
      <Text style={[styles.tableCell, styles.contactCell]}>
        {guest.email ? `${guest.email}\n` : ""}
        {guest.phone ? guest.phone : ""}
      </Text>
      <Text style={[styles.tableCell, styles.categoryCell]}>{guest.category}</Text>
      <Text style={[styles.tableCell, styles.priorityCell]}>{guest.priority}</Text>
      <Text style={[styles.tableCell, styles.statusCell]}>{guest.status}</Text>
      {customFields.map((field) => (
        <Text key={field.id} style={[styles.tableCell, styles.customFieldCell]}>
          {String(guest.custom_values[field.name] || "-")}
        </Text>
      ))}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          {event ? `Guest List: ${event.name}` : "Guest List"}
        </Text>

        {/* Event Information Section (if event is provided) */}
        {event && (
          <View style={styles.eventInfo}>
            <Text style={styles.subheader}>Event Details</Text>
            <Text style={styles.eventDetail}>
              <Text style={{ fontWeight: 'bold' }}>Name: </Text> 
              {event.name}
            </Text>
            {event.date && (
              <Text style={styles.eventDetail}>
                <Text style={{ fontWeight: 'bold' }}>Date: </Text> 
                {format(new Date(event.date), "PPp")}
              </Text>
            )}
            {event.description && (
              <Text style={styles.eventDetail}>
                <Text style={{ fontWeight: 'bold' }}>Description: </Text> 
                {event.description}
              </Text>
            )}
            <Text style={styles.eventDetail}>
              <Text style={{ fontWeight: 'bold' }}>Total Invites: </Text> 
              {eventGuests.length}
            </Text>
          </View>
        )}

        {/* Summary Section */}
        <View style={styles.summary}>
          <Text style={styles.subheader}>Summary</Text>
          <Text style={styles.summaryText}>Total Guests: {guests.length}</Text>
          <Text style={styles.summaryText}>
            Confirmed: {statusCount.Confirmed} | Maybe: {statusCount.Maybe} |
            Unavailable: {statusCount.Unavailable} | Pending:{" "}
            {statusCount.Pending}
          </Text>
        </View>

        {/* All Guests Table with custom fields */}
        <Text style={styles.subheader}>All Guests</Text>
        <View style={styles.table}>
          {renderTableHeaders()}
          {guests.map(renderGuestRow)}
        </View>

        {/* Guests by Category */}
        <Text style={styles.subheader}>Guests by Category</Text>
        {Object.keys(guestsByCategory).map((category) => (
          <View key={category} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>
              {category} ({guestsByCategory[category].length})
            </Text>
            <View style={styles.table}>
              {renderTableHeaders()}
              {guestsByCategory[category].map(renderGuestRow)}
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} with Saahitt Event
          Invite Manager
        </Text>
      </Page>
    </Document>
  );
};

export default GuestListPDF;
