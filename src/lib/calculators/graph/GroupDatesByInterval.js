// Group dates by mod for bar graph etc
export const groupDatesByMonth = (dates) => {
  let dateCountByMonth = {};
  let earliestMonth = -1;
  let latestMonth = -1;
  dates.forEach((date) => {
    const monthCode = (date.getFullYear() % 100) * 100 + (date.getMonth() + 1);
    if (monthCode < earliestMonth || earliestMonth === -1) {
      earliestMonth = monthCode;
    }
    if (monthCode > latestMonth || latestMonth === -1) {
      latestMonth = monthCode;
    }
    monthCode in dateCountByMonth
      ? dateCountByMonth[monthCode]++
      : (dateCountByMonth[monthCode] = 1);
  });
  for (
    let year = Math.floor(earliestMonth / 100);
    year <= Math.floor(latestMonth / 100);
    year++
  ) {
    for (let month = 1; month <= 12; month++) {
      const monthCode = year * 100 + month;
      if (
        !(monthCode in dateCountByMonth) &&
        monthCode > earliestMonth &&
        monthCode < latestMonth
      ) {
        dateCountByMonth[monthCode] = 0;
      }
    }
  }
  let monthArray = [];
  for (const month in dateCountByMonth) {
    monthArray.push({
      month: month.toString(),
      count: dateCountByMonth[month],
    });
  }
  console.log(monthArray);
  return monthArray;
};

// Group dates by hour of day
export const groupDatesByHour = (dates) => {
  let dateCountByHour = [];
  [...Array(24).keys()].forEach((hour) => dateCountByHour[hour] = {hour, count: 0});
  dates.forEach((date) => dateCountByHour[date.getHours()].count++);
  console.log(dateCountByHour);
  return dateCountByHour;
};
