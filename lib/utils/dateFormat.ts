/**
 * Format date from YYYY-MM-DD to "DD MMM" format (e.g., "17 feb", "20 mar")
 */
export const formatDateShort = (dateString: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  
  return `${day} ${month}`;
};

/**
 * Format date from YYYY-MM-DD to "DD MMM, YYYY" format
 */
export const formatDateFull = (dateString: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
