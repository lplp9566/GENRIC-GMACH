export function getYearFromDate(date: Date): number {
    try {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        throw new Error(`Invalid date: ${date}`);
      }
      return newDate.getFullYear();
    } catch (error) {
      throw new Error(error.message);
    }
  }
  export function getMonthFromDate(date: Date): number {
    try {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        throw new Error(`Invalid date: ${date}`);
      }
      return newDate.getMonth() + 1;
    } catch (error) {
      throw new Error(error.message);
    }
  }