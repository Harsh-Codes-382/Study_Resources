// Excel / Google Sheets links for the (password-protected) Interview Prep shelf.
//
// This is the ONE file you edit to manage the list. To add a sheet, drop a new
// object into SHEETS with a title, the full share/edit URL, and an optional note.
// The newest-first order is just the array order — put new ones wherever you like.
//
//   { title: "My tracker", url: "https://docs.google.com/spreadsheets/d/…", note: "DSA progress" }
//
// The list lives behind the same password gate as the rest of Interview Prep
// (it renders at /interview-prep/sheets, and that path is gated — see
// src/lib/interviewGate.js and src/components/ShelfRoute.jsx).

// URL slug for the sheets view, appended to the Interview Prep shelf url.
export const SHEETS_SLUG = "sheets";

export const SHEETS = [
  {
    title: "DSA Questions Sheet",
    url: "https://docs.google.com/spreadsheets/d/1pvGykwRyYgKD6tIBRfXBnTNrA0owR03i6u0BGi6i50w/edit?gid=1550549622#gid=1550549622",
    note: "Google Sheet",
  },
];
