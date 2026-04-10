require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Helper to get ISO Week and Year
 */
function getISOWeekData(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Monday = 1, Sunday = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
}

app.get('/', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*'); // Enable CORS for your GitHub page

    const startStr = process.env.START_DATE;
    if (!startStr) return res.status(500).send("START_DATE not configured.");

    const startDate = new Date(startStr);
    let targetDate = new Date(); // Default to current date

    // --- APPLY EXTERNAL VARIABLE LOGIC ---
    const externalDate = req.query.date; // Expecting dd/mm/yyyy

    if (externalDate) {
        const parts = externalDate.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
            const year = parseInt(parts[2], 10);
            
            const parsedDate = new Date(year, month, day);
            
            // Check if the parsed date is valid
            if (!isNaN(parsedDate.getTime())) {
                targetDate = parsedDate;
            } else {
                return res.status(400).send("Invalid date format. Use dd/mm/yyyy.");
            }
        } else {
            return res.status(400).send("Format must be dd/mm/yyyy.");
        }
    }
    // --------------------------------------

    // Calculate total weeks
    const timeDiff = targetDate.getTime() - startDate.getTime();
    const totalWeeks = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));

    const iso = getISOWeekData(targetDate);
    
    // Format week number to always be two digits (e.g., w01 instead of w1)
    const formattedWeek = iso.week.toString().padStart(2, '0');

    // Result format: "TotalWeeks Year-wWeek"
    res.send(`${totalWeeks} ${iso.year}-w${formattedWeek}`);
});

app.listen(PORT, () => console.log(`API active on port ${PORT}`));