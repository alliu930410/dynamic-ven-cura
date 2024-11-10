export const trimContent = (content: string, maxLength = 12) => {
  if (content.length <= maxLength) return content;
  const half = Math.floor((maxLength - 3) / 2); // Adjust for "..." length
  return `${content.slice(0, half)}...${content.slice(-half)}`;
};
