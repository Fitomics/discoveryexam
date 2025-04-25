// Ensure data is loaded (optional check)
if (typeof vo2ReferenceTable === 'undefined' || typeof hazardRatios === 'undefined') {
    console.error("vo2chart.js Error: vo2data.js must be loaded first.");
}

/**
 * Generates or updates the VO2 Max category hazard ratio chart.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} gender - 'FEMALE' or 'MALE'.
 * @param {number} age - Age in years.
 * @param {number} vo2Mets - User's VO2 Max in METs.
 * @returns {Chart|null} - The new Chart instance or null on error.
 */
function createOrUpdateVo2CategoryChart(ctx, gender, age, vo2Mets) {
    if (!ctx) {
        console.error("createOrUpdateVo2CategoryChart: Invalid canvas context provided.");
        return null;
    }
    if (typeof vo2ReferenceTable === 'undefined' || typeof hazardRatios === 'undefined') {
        console.error("createOrUpdateVo2CategoryChart: Reference data not available.");
        // Display error on canvas
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Error: Reference data missing.", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return null;
    }
    if (!gender || isNaN(age) || isNaN(vo2Mets)) {
         console.error("createOrUpdateVo2CategoryChart: Invalid gender, age, or vo2Mets provided.");
         // Display error on canvas
         ctx.font = "16px Arial";
         ctx.fillStyle = "red";
         ctx.textAlign = "center";
         ctx.fillText("Error: Invalid input data.", ctx.canvas.width / 2, ctx.canvas.height / 2);
         return null;
    }

    // Find all entries for the specific gender and age group
    const categoryData = vo2ReferenceTable.filter(r =>
        r.gender === gender.toUpperCase() && age >= r.ageLow && age <= r.ageHigh
    );

    if (categoryData.length === 0) {
        console.warn(`createOrUpdateVo2CategoryChart: No reference data found for Gender: ${gender}, Age: ${age}.`);
        // Display error on canvas
        ctx.font = "16px Arial";
        ctx.fillStyle = "orange"; // Use a warning color
        ctx.textAlign = "center";
        ctx.fillText(`No reference data for ${gender}, Age ${age}.`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        return null;
    }

    const categories = ['Low', 'Below Average', 'Above Average', 'High', 'Elite'];
    const labels = categories.map(cat => {
        const ref = categoryData.find(r => r.category === cat);
        const range = ref ? (ref.max < 100 ? `${ref.min.toFixed(1)}–${ref.max.toFixed(1)} METs` : `≥${ref.min.toFixed(1)} METs`) : 'N/A';
        return `${cat}\n(${range})`;
    });

    const data = categories.map(cat => hazardRatios[cat] || 0); // Default to 0 if ratio not found

    // Find the user's category entry within the filtered data
    const userCategoryEntry = categoryData.find(r =>
        (vo2Mets >= r.min && vo2Mets <= r.max) || (vo2Mets > r.max && r.category === 'Elite')
    );
    const userIndex = userCategoryEntry ? categories.indexOf(userCategoryEntry.category) : -1;

    // Destroy existing chart on the same canvas if present
    let existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    // Create the new Chart instance with styling consistent with app.js
    return new Chart(ctx, {
        type: 'line', // Consistent type
        data: {
            labels,
            datasets: [{
                label: 'Hazard Ratio by VO₂ Max Category',
                data,
                borderColor: '#003b59', // Consistent color
                backgroundColor: 'rgba(0, 59, 89, 0.1)', // Consistent fill
                tension: 0.1,
                fill: true,
                pointBackgroundColor: data.map((_, i) => i === userIndex ? '#e4ac61' : '#003b59'), // Consistent highlight
                pointRadius: data.map((_, i) => i === userIndex ? 8 : 5), // Consistent size
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Important for PDF generation
            plugins: {
                legend: { display: false }, // Consistent legend display
                tooltip: {
                    enabled: true,
                    callbacks: {
                        title: (tooltipItems) => tooltipItems[0].label.replace('\n', ' '),
                        label: (tooltipItem) => ` Hazard Ratio: ${tooltipItem.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0.1, // Consistent scale
                    max: 1.1, // Consistent scale
                    title: {
                        display: true,
                        text: 'Relative Hazard Ratio (All-Cause Mortality)',
                        font: { size: 12 }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}