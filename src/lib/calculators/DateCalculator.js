// Calculate end date based on a start date and a duration.
export const calculateDate = (startDate, days) => {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days);
    return endDate;
};
