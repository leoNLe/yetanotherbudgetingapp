export const yearMonthToString = (year, month) => {
  return month < 10 ? `${year}0${month}` : `${year}${month}`;
};

export const parseDate = (date) => {
  const dateStringed = date.toString();
  const year = dateStringed.substring(0, 4);
  const month = dateStringed.substring(4, 6);
  const day = dateStringed.substring(6, 8);
  return `${month}/${day}/${year}`;
};
