export type PowerBiReport = {
  id: string;
  title: string;
  category: string;
  owner: string;
  status: "Live" | "Draft" | "Secure";
  updated: string;
  embedUrl: string;
  description: string;
  isSecure?: boolean;
  reportId?: string;
  datasetId?: string;
  groupId?: string;
};

export const powerBiReports: PowerBiReport[] = [
  {
    id: "production-details",
    title: "Production Details",
    category: "Production",
    owner: "Operations",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiZDBkZmRlMWUtY2M1Ny00NGQyLWE3YmItNGY2NzRhZDViY2FhIiwidCI6ImZlM2U5MWVmLTQzODktNDk4NS1hZTg5LTk0YTY1MjMwNjE3YSJ9",
    description: "Production report carried over from the older IMAGE-I reports library.",
  },
  {
    id: "active-report",
    title: "Active report",
    category: "Fleet",
    owner: "Operations",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiYjQ4OGRhMmItNDYyZC00NWM1LWEzYjMtZjgyOWVhNmQzMmU2IiwidCI6IjFlNmIzZWUzLTQ4NWQtNGJlMC1iZGQwLWFkYTRhYTM1ZTVlNCJ9",
    description: "Fleet activity and active vehicle reporting.",
  },
  {
    id: "manpower-per-vehicle",
    title: "Cost of Manpower per vehicle- fleet wise",
    category: "Costing",
    owner: "Finance",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiMjM3YWE3NjUtMmY3MC00NDcwLWE3Y2QtNDkxOGQ3Yzk5MTNiIiwidCI6IjFlNmIzZWUzLTQ4NWQtNGJlMC1iZGQwLWFkYTRhYTM1ZTVlNCJ9",
    description: "Fleet-wise manpower cost analysis per vehicle.",
  },
  {
    id: "profit-loss-ytd",
    title: "Profit and loss- Month on month and cumulative YTD",
    category: "Finance",
    owner: "Finance",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNGJhZjRmNzEtZDg5My00ZWEzLWJlZWQtMjk5YTFhYTAwZTI4IiwidCI6IjFlNmIzZWUzLTQ4NWQtNGJlMC1iZGQwLWFkYTRhYTM1ZTVlNCJ9",
    description: "Month-on-month and cumulative YTD profit and loss view.",
  },
  {
    id: "revenue-ytd",
    title: "Revenue report- Month on month and cumulative YTD",
    category: "Finance",
    owner: "Finance",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiY2M1N2U3ZTEtODI1My00NWQ1LWEyYWEtYzVhNTU3NmQ4OTM0IiwidCI6IjFlNmIzZWUzLTQ4NWQtNGJlMC1iZGQwLWFkYTRhYTM1ZTVlNCJ9",
    description: "Revenue performance by month with cumulative YTD tracking.",
  },
  {
    id: "tyre-information",
    title: "Tyre Information Report",
    category: "Fleet",
    owner: "Maintenance",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNTA3NTI4MmYtZDUxMS00MDE4LWFhMzYtZDBkYmRmMDY1MTIyIiwidCI6IjFlNmIzZWUzLTQ4NWQtNGJlMC1iZGQwLWFkYTRhYTM1ZTVlNCJ9",
    description: "Tyre lifecycle, fleet allocation, and status reporting.",
  },
  {
    id: "damaged-tyres",
    title: "Fleetwise wise damaged tyres",
    category: "Fleet",
    owner: "Maintenance",
    status: "Live",
    updated: "Legacy source",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiYTc5ZjhhNTUtYWJkYi00OTk1LWI2OGQtOGI2OTU1MzA3OWQ4IiwidCI6IjFlNmIzZWUzLTQ4NWQtNGJlMC1iZGQwLWFkYTRhYTM1ZTVlNCJ9",
    description: "Fleet-wise damage report for tyres and maintenance follow-up.",
  },
  {
    id: "secure-powerbi-workspace",
    title: "Secure Power BI Workspace Report",
    category: "Power BI",
    owner: "Admin",
    status: "Secure",
    updated: "Token required",
    embedUrl: "",
    description:
      "Secure embed support from the legacy PowerBI page. Connect a backend token endpoint to enable live embedding, refresh, and export.",
    isSecure: true,
    reportId: "dace8762-e8b5-4be3-bb78-899c501dc210",
    datasetId: "abf3bbc2-4532-4a4f-9eab-68f30196e9c1",
    groupId: "ED802751-EF77-4939-810B-0CA99009C203",
  },
];

export function getPowerBiReport(id?: string | null) {
  return powerBiReports.find((report) => report.id === id) ?? powerBiReports[0];
}
