export const sanitizeInput = (input: string): string => {
  // Check if the input is a valid date
  if (!isNaN(Date.parse(input))) {
    return input.trim(); // If it's a date, return it as-is after trimming whitespace
  }

  // If it's not a date, sanitize by removing all non-alphanumeric characters and underscores
  return input.replace(/[^a-zA-Z0-9_]/g, "").trim();
};
