const mongoose = require("mongoose");
const Orders = require("../models/orderSchema");

async function getSalesData(req) {
    const query = req.query.filter || 'week'; // Default to 'week'

// Date range for the filter
let startDate, endDate;

// Get the current date
const currentDate = new Date();

switch (query) {
  case "week":
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyData = await Orders.aggregate([
      {
        $match: {
          placed_at: { $gte: startOfWeek, $lte: endOfWeek },
          order_status: { $in: ["Shipped", "Delivered"] },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$placed_at" }, // Day of the week (1 = Sunday, 7 = Saturday)
          totalSales: { $sum: "$total_amount" },
        },
      },
      { $sort: { "_id": 1 } }, // Sort by day of week
    ]);

    const weeklyAmounts = new Array(7).fill(0); // Fill default values
    weeklyData.forEach((d) => {
      weeklyAmounts[d._id - 1] = d.totalSales; // Map sales to the correct day
    });

    return {
      labels: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      values: weeklyAmounts,
    };

  case "month":
    const filterStartDate = new Date(currentDate.getFullYear(), 0, 1);
    const filterEndDate = new Date(currentDate.getFullYear() + 1, 0, 1);

    const monthlyData = await Orders.aggregate([
      {
        $match: {
          placed_at: { $gte: filterStartDate, $lt: filterEndDate },
          order_status: { $in: ["Shipped", "Delivered"] },
        },
      },
      {
        $group: {
          _id: { $month: "$placed_at" }, // Month (1 = Jan, 12 = Dec)
          totalSales: { $sum: "$total_amount" },
        },
      },
      { $sort: { "_id": 1 } }, // Sort by month
    ]);

    const monthlyAmounts = new Array(12).fill(0); // Fill default values
    monthlyData.forEach((d) => {
      monthlyAmounts[d._id - 1] = d.totalSales; // Map sales to the correct month
    });

    return {
      labels: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],
      values: monthlyAmounts,
    };

  case "year":
    const startYear = currentDate.getFullYear() - 4; 
    const endYear = currentDate.getFullYear() + 1;

    const yearlyData = await Orders.aggregate([
      {
        $match: {
          placed_at: {
            $gte: new Date(startYear, 0, 1),
            $lt: new Date(endYear, 0, 1),
          },
          order_status: { $in: ["Shipped", "Delivered"] },
        },
      },
      {
        $group: {
          _id: { $year: "$placed_at" },
          totalSales: { $sum: "$total_amount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const yearLabels = [];
    for (let i = startYear; i <= currentDate.getFullYear(); i++) {
      yearLabels.push(i);
    }

    const yearlyAmounts = new Array(5).fill(0); // Fill default values
    yearlyData.forEach((d) => {
      const index = yearLabels.indexOf(d._id);
      if (index !== -1) {
        yearlyAmounts[index] = d.totalSales;
      }
    });

    return {
      labels: yearLabels,
      values: yearlyAmounts,
    };

}
}

module.exports = {getSalesData}