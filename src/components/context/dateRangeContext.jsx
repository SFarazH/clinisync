"use client";
import { createContext, useContext, useState } from "react";
import { subDays } from "date-fns";

const DateRangeContext = createContext();

export const DateRangeProvider = ({ children }) => {
  const today = new Date();
  const oneWeekAgo = subDays(today, 7);

  const [dateRange, setDateRange] = useState({
    from: oneWeekAgo,
    to: today,
  });

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => useContext(DateRangeContext);
