/**
 * Calculates the VO2 Max percentile based on gender, age, and VO2 value.
 * Uses METs for calculation based on provided coefficients.
 * @param {string} gender - 'FEMALE' or 'MALE'
 * @param {number|string} age - Age in years
 * @param {number|string} vo2Value - VO2 Max value in ml/kg/min
 * @returns {string} - Percentile formatted to one decimal place, '>99.9', or 'N/A'.
 */

function calculateVo2Percentile(gender, age, vo2Value) {
    // Return early if any required values are missing or invalid
    if (!gender || !age || !vo2Value || isNaN(parseFloat(vo2Value)) || isNaN(parseInt(age))) {
        console.warn("calculateVo2Percentile: Missing or invalid input", { gender, age, vo2Value });
        return 'N/A';
    }
  
    gender = String(gender).toUpperCase();
    age = parseInt(age);
    vo2Value = parseFloat(vo2Value);
  
    // Convert VO2 Max to METS for the calculation
    const vo2ValueMets = vo2Value / 3.5;
  
    // Percentile calculation table using METS
    const percentileTable = [
        { gender: 'FEMALE', ageLow: 18, ageHigh: 19, intercept: -38.39370468, slope: 8.408706891 },
        { gender: 'FEMALE', ageLow: 20, ageHigh: 29, intercept: -30.77369941, slope: 8.710278691 },
        { gender: 'FEMALE', ageLow: 30, ageHigh: 39, intercept: -31.6543755, slope: 9.256543442 },
        { gender: 'FEMALE', ageLow: 40, ageHigh: 49, intercept: -31.79589193, slope: 9.657290896 },
        { gender: 'FEMALE', ageLow: 50, ageHigh: 59, intercept: -30.18427375, slope: 10.01526944 },
        { gender: 'FEMALE', ageLow: 60, ageHigh: 69, intercept: -31.79829302, slope: 11.91748344 },
        { gender: 'FEMALE', ageLow: 70, ageHigh: 79, intercept: -30.41205179, slope: 13.75099602 },
        { gender: 'FEMALE', ageLow: 80, ageHigh: 89, intercept: -33.57744583, slope: 16.0898446 },
        { gender: 'MALE', ageLow: 18, ageHigh: 19, intercept: -36.26322582, slope: 7.433576287 },
        { gender: 'MALE', ageLow: 20, ageHigh: 29, intercept: -36.33493979, slope: 7.793652529 },
        { gender: 'MALE', ageLow: 30, ageHigh: 39, intercept: -38.26153919, slope: 8.37609897 },
        { gender: 'MALE', ageLow: 40, ageHigh: 49, intercept: -38.95930276, slope: 8.659028352 },
        { gender: 'MALE', ageLow: 50, ageHigh: 59, intercept: -33.05833684, slope: 8.969738411 },
        { gender: 'MALE', ageLow: 60, ageHigh: 69, intercept: -30.50893082, slope: 9.931446541 },
        { gender: 'MALE', ageLow: 70, ageHigh: 79, intercept: -30.23581148, slope: 11.60411056 },
        { gender: 'MALE', ageLow: 80, ageHigh: 89, intercept: -30.85004941, slope: 13.4229249 }
    ];
  
    // Find the appropriate row in the table
    const row = percentileTable.find(r =>
        r.gender === gender && age >= r.ageLow && age <= r.ageHigh
    );
  
    if (!row) {
        console.warn(`calculateVo2Percentile: No matching row found for gender ${gender} and age ${age}`);
        return 'N/A';
    }
  
    // Apply the formula using METS
    const percentile = row.intercept + (row.slope * vo2ValueMets);
  
    // Handle edge cases and formatting
    if (isNaN(percentile)) {
        return 'N/A';
    } else if (percentile >= 100) {
        return ">99.9"; // Special notation for very high percentiles
    } else if (percentile < 0) {
        return "0.0"; // Floor at 0
    } else {
        return percentile.toFixed(1); // Format to 1 decimal place
    }
  }
  
  /**
  * Helper function to safely get data from localStorage, clean it, format it,
  * and populate an input field.
  * @param {string} elementId - The ID of the input element.
  * @param {string} storageKey - The key in localStorage.
  * @param {object} [options={}] - Optional parameters.
  * @param {*} [options.defaultValue='N/A'] - Value to use if item not found or empty.
  * @param {function} [options.formatter] - Function to format the value before setting.
  */
  function populateField(elementId, storageKey, options = {}) {
    const element = document.getElementById(elementId);
    if (!element) {
        // console.warn(`Element with ID "${elementId}" not found.`); // Keep commented unless debugging
        return; // Skip if element doesn't exist
    }
  
    let value = localStorage.getItem(storageKey);
    const defaultValue = options.defaultValue !== undefined ? options.defaultValue : 'N/A';
  
    if (value === null || value === undefined || String(value).trim() === '') {
        value = defaultValue;
    } else {
        // Clean known units and trim whitespace
        value = String(value)
            .replace(/ kcal\/day/gi, '') // RMR unit
            .replace(/ kcal/gi, '')
            .replace(/ ml\/kg\/min/gi, '') // VO2 Max unit
            .replace(/ ml/gi, '')
            .replace(/ g/gi, '')
            .replace(/ kg\/m²/gi, '') // BMI unit
            .replace(/ kg\/mg/gi, '') // Potential typo? Or specific unit?
            .replace(/ kg/gi, '')
            .replace(/ lbs/gi, '')
            .replace(/ %ile/gi, '') // Percentile unit
            .replace(/ %/gi, '')
            .replace(/ bpm/gi, '') // Heart rate unit
            .replace(/ mmHg/gi, '') // Blood pressure unit
            .trim();
  
        // Apply formatting function if provided
        if (typeof options.formatter === 'function') {
            value = options.formatter(value);
        }
    }
  
    // Ensure final value is not just whitespace if defaultValue wasn't used and it's a string
    if (typeof value === 'string' && value.trim() === '') {
        value = defaultValue;
    }
  
    // Check if the element is an input or something else (like span, div)
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
       element.value = value;
    } else {
       element.textContent = value; // For non-input elements
    }
  }
  
  /**
  * Formats a date string (YYYY-MM-DD) to MM/DD/YYYY.
  * @param {string} dateString - Date string in YYYY-MM-DD format.
  * @returns {string} - Formatted date or 'N/A'.
  */
  function formatDate(dateString) {
    if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return 'N/A'; // Basic validation
    }
    try {
        // Add time part and specify UTC to avoid timezone interpretation issues
        const date = new Date(dateString + 'T00:00:00Z');
        // Use UTC methods to get the correct date parts regardless of local timezone
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'N/A'; // Return N/A on error
    }
  }
  
  /**
  * Calculates estimated rep maxes from 1 to 15 based on a 10RM value.
  * @param {number|string} rm10 - The 10 Rep Max value.
  * @returns {Array<string|number>} - Array of calculated rep maxes (1RM to 15RM), or 'N/A' if input is invalid.
  */
  function calculateRepMaxes(rm10) {
    const rm10Value = parseFloat(rm10);
    if (isNaN(rm10Value) || rm10Value <= 0) {
        return Array(15).fill('N/A');
    }
  
    // Epley formula coefficient for 10RM (approx 0.75, using provided 0.79)
    const RM10_COEFFICIENT = 0.79;
    const rm1 = rm10Value / RM10_COEFFICIENT;
  
    // Coefficients for other rep maxes relative to 1RM (example, can be adjusted)
    // Using the provided coefficients
    const coefficients = [
        1.00, 0.98, 0.96, 0.93, 0.91, // 1-5 RM
        0.88, 0.86, 0.84, 0.81, 0.79, // 6-10 RM
        0.77, 0.75, 0.73, 0.71, 0.69  // 11-15 RM
    ];
  
    // Calculate all rep maxes and round
    return coefficients.map(coef => Math.round(rm1 * coef));
  }
  
  /**
  * Generates the PDF report from HTML elements.
  */
  async function generatePDF() {
    // Ensure jsPDF is loaded
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        console.error("jsPDF library is not loaded.");
        alert("Error: PDF generation library not loaded.");
        return;
    }
     // Ensure html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
        console.error("html2canvas library is not loaded.");
        alert("Error: PDF generation library (html2canvas) not loaded.");
        return;
    }
  
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('portrait', 'pt', 'letter'); // Letter size (612 x 792 pt)
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    const pdfWrapper = document.getElementById('pdfWrapper');
    if (!pdfWrapper) {
        console.error("Element with ID 'pdfWrapper' not found.");
        alert("Error: Cannot find the content wrapper for PDF generation.");
        return;
    }
  
    // Get only direct children with the 'page' class
    const pages = Array.from(pdfWrapper.children).filter(el => el.classList.contains('page'));
  
    if (pages.length === 0) {
        console.warn("No elements with class 'page' found inside 'pdfWrapper'.");
        alert("Warning: No pages found to generate PDF.");
        return;
    }
  
    console.log(`Generating PDF with ${pages.length} pages...`);
    document.body.style.cursor = 'wait'; // Indicate processing
  
    try {
        for (let i = 0; i < pages.length; i++) {
            const pageElement = pages[i];
            console.log(`Processing page ${i + 1}...`);
  
            try {
                const canvas = await html2canvas(pageElement, {
                    scale: 2, // Increase resolution for better quality
                    useCORS: true, // Attempt to load cross-origin images
                    logging: false, // Reduce console noise
                    width: pageElement.offsetWidth,
                    height: pageElement.offsetHeight,
                    // Ensure charts are rendered before capturing
                    onclone: (clonedDoc) => {
                        // Might need specific logic here if charts render very asynchronously
                        // e.g., wait for chart animations to complete if necessary.
                    }
                });
  
                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
  
                // Calculate image dimensions to fit PDF page width, maintaining aspect ratio
                const imgWidth = pdfWidth;
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                let pageHeightRequired = imgHeight;
                let yPosition = 0;
  
                // Add the image
                pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
  
                // Add a new page if this isn't the last element
                if (i < pages.length - 1) {
                    console.log(`Adding new page after page ${i + 1}`);
                    pdf.addPage();
                }
  
            } catch (error) {
                console.error(`Error processing page ${i + 1}:`, error);
                // Add error text to the PDF page instead of the image
                pdf.setTextColor(255, 0, 0); // Red text
                pdf.setFontSize(12);
                pdf.text(`Error rendering page ${i + 1}. Check console logs.`, 40, 40);
                pdf.setTextColor(0, 0, 0); // Reset text color
                if (i < pages.length - 1) {
                    pdf.addPage(); // Still add a new page for the next attempt
                }
                // Optionally continue to the next page or break the loop
                // continue;
            }
        }
  
        // Get filename components safely
        const firstName = localStorage.getItem('first_name') || 'Client';
        const lastName = localStorage.getItem('last_name') || 'Report';
        const examDateRaw = localStorage.getItem('exam_date'); // YYYY-MM-DD
        const examDateFormatted = examDateRaw ? examDateRaw.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
        const safeFirstName = firstName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeLastName = lastName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `Discovery_Report_${safeLastName}_${safeFirstName}_${examDateFormatted}.pdf`;
  
        console.log("Saving PDF as:", filename);
        pdf.save(filename);
  
    } catch (globalError) {
        console.error("An unexpected error occurred during PDF generation:", globalError);
        alert("An error occurred during PDF generation. Please check the console.");
    } finally {
        document.body.style.cursor = 'default'; // Reset cursor regardless of success/failure
        console.log("PDF generation process finished.");
    }
  }
  
  
  // --- Charting Logic ---
  
  // --- BMI Charting ---
  const GAP_BMI = 0.5; // Gap around the user's BMI point in the line chart
  const xs_bmi = Array.from({ length: 401 }, (_, i) => 10 + i * 0.1); // X-axis values for BMI (10 to 50)
  
  // Hazard ratio functions for BMI
  function hrAll(b) { return b < 22.5 ? Math.exp(0.049 * (22.5 - b)) : b <= 25 ? 1 : Math.exp(0.054 * (b - 25)); }
  const CD_PIVOT = 26; function hrCD(b) { return b < CD_PIVOT ? Math.exp(0.0629 * (CD_PIVOT - b)) : Math.exp(0.0494 * (b - CD_PIVOT)); }
  const NCD_PIVOT = 25; function hrNCD(b) { return b < NCD_PIVOT ? Math.exp(0.0373 * (NCD_PIVOT - b)) : Math.exp(0.0398 * (b - NCD_PIVOT)); }
  
  // Build BMI chart instance
  function buildBmiChart(elementId, hrFn, baseColor, savedBmi) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`BMI Chart Error: Canvas element with ID "${elementId}" not found.`);
        return null;
    }
    const colorMap = { 'crimson': 'rgba(220,20,60,0.2)', 'royalblue': 'rgba(65,105,225,0.2)', 'seagreen': 'rgba(46,139,87,0.2)' };
    const lineData = xs_bmi.map(x => ({ x: x, y: (savedBmi && Math.abs(x - savedBmi) < GAP_BMI) ? null : (hrFn(x) - 1) * 100 }));
  
    return new Chart(element, {
        type: 'line',
        data: {
            datasets: [
                { label: elementId, data: lineData, borderColor: baseColor, borderWidth: 1.5, tension: 0.3, cubicInterpolationMode: 'monotone', spanGaps: false, fill: false, pointRadius: 0, order: 0 },
                { label: 'RR=0%', data: xs_bmi.map(x => ({ x: x, y: 0 })), borderColor: 'rgba(102,102,102,0.4)', borderDash: [6, 4], borderWidth: 1, pointRadius: 0, fill: false, order: 1 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: { scatterOnTop: true, legend: { display: false }, tooltip: { enabled: true } },
            scales: {
                x: { type: 'linear', min: 9, max: 55, title: { display: true, text: 'BMI (kg/m²)' } },
                y: { type: 'linear', min: -20, max: 250, grace: '5%', title: { display: true, text: 'Relative risk increase (%)' } }
            }
        }
    });
  }
  
  // Update BMI charts with user's point
  function updateBmiCharts(charts, bmiValue) {
    const isValidBmi = !isNaN(bmiValue) && bmiValue >= 10 && bmiValue <= 50;
    const errorMsg = document.getElementById('error-message'); // Assuming this element exists for BMI input validation
    if (errorMsg) errorMsg.style.display = isValidBmi ? 'none' : 'block';
  
    charts.forEach(({ chart, fn }) => {
        if (!chart) return; // Skip if chart wasn't created
  
        // Reset datasets to base curves
        chart.data.datasets = chart.data.datasets.filter(ds => ds.label !== 'User BMI'); // Remove old scatter if exists
        chart.data.datasets[0].data = xs_bmi.map(x => ({ x: x, y: (isValidBmi && Math.abs(x - bmiValue) < GAP_BMI) ? null : (fn(x) - 1) * 100 })); // Update line data for gaps
  
        if (isValidBmi) {
            const rr = (fn(bmiValue) - 1) * 100;
            chart.data.datasets.push({
                type: 'scatter',
                label: 'User BMI', // Added label for easier removal
                data: [{ x: bmiValue, y: rr }],
                pointRadius: 8, pointStyle: 'rectRot', pointBackgroundColor: 'rgba(0,0,0,0.8)', pointBorderColor: 'rgba(255,255,255,0.9)', pointBorderWidth: 1.5,
                showLine: false, order: 99 // Ensure it's drawn on top
            });
        }
        chart.update('none'); // Use 'none' for no animation
    });
  }
  
  // Register Chart.js plugin to draw scatter points on top of lines
  Chart.register({
    id: 'scatterOnTop',
    afterDatasetsDraw(chartInstance) {
        chartInstance.data.datasets.forEach((dataset, i) => {
            if (dataset.type === 'scatter') {
                const meta = chartInstance.getDatasetMeta(i);
                if (meta.data && meta.data.length > 0) {
                   meta.data.forEach(point => point.draw(chartInstance.ctx));
                }
            }
        });
    }
  });
  
  
  // --- FMI/FFMI Charting ---
  function hrFMI(fmi) { if (fmi < 5) { return Math.exp(0.12 * (5 - fmi)); } else { return 1 + 0.02 * Math.pow(fmi - 5, 1.8); } }
  function hrFFMI(ffmi) { if (ffmi < 22) { return Math.exp(0.08 * (22 - ffmi)); } else { return 1 + 0.02 * Math.pow(ffmi - 22, 1.5); } }
  
  function buildFmiffmiChart(element, data, label, color, xMin, xMax) {
    if (!element) return null;
    const refLineData = (xMin === 0 ? Array.from({ length: 201 }, (_, i) => ({ x: i * 0.1, y: 1 })) : Array.from({ length: 161 }, (_, i) => ({ x: 12 + i * 0.1, y: 1 })));
  
    return new Chart(element, {
        type: 'line',
        data: {
            datasets: [
                { label: label, data: data, borderColor: color, backgroundColor: color + '20', tension: 0.4, borderWidth: 2, pointRadius: 0, fill: false },
                { label: 'Reference HR=1.0', data: refLineData, borderColor: '#666', borderDash: [6, 4], pointRadius: 0, borderWidth: 1 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: {
                x: { type: 'linear', min: xMin, max: xMax, title: { display: true, text: label === 'FMI HR' ? 'FMI (kg/m²)' : 'FFMI (kg/m²)' }, ticks: { stepSize: 2 } },
                y: { min: 0.5, max: 3.5, title: { display: true, text: 'Hazard ratio' }, ticks: { stepSize: 0.5 } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: { label: (ctx) => ` ${label.includes('FMI') ? 'FMI' : 'FFMI'}: ${ctx.parsed.x.toFixed(1)}, HR: ${ctx.parsed.y.toFixed(2)}` }
                }
            }
        }
    });
  }
  
  function updateFmiffmiChart(chart, value, hrFunc) {
    if (!chart || isNaN(value)) return;
    // Remove previous scatter point if it exists
    chart.data.datasets = chart.data.datasets.filter(d => d.type !== 'scatter');
    // Add new scatter point
    chart.data.datasets.push({
        type: 'scatter',
        label: 'User Value', // Label for easier identification/removal
        data: [{ x: value, y: hrFunc(value) }],
        pointRadius: 8, pointStyle: 'rectRot', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#fff', borderWidth: 2
    });
    chart.update('none');
  }
  
  // --- BP / RHR Charting ---
  function rrRHR_J(rhr) { if (rhr < 50) return Math.pow(1.12, (50 - rhr) / 10); if (rhr <= 60) return 1; return Math.pow(1.09, (rhr - 60) / 10); }
  const sbpEquation = sbp => { const base = Math.pow(1.02, (sbp - 120) / 10); return sbp > 140 ? base * (1 + 0.008 * Math.pow(sbp - 140, 1.3)) : base; };
  const dbpEquation = dbp => { const base = Math.pow(1.02, (dbp - 80) / 5); return dbp > 90 ? base * (1 + 0.01 * Math.pow(dbp - 90, 1.2)) : base; };
  const genData = (range, step, fn) => { let d = []; for (let x = range[0]; x <= range[1]; x += step) { d.push({ x: x, y: parseFloat(fn(x).toFixed(3)) }); } return d; };
  
  const createRiskCurveChart = (ctx, label, dataPoints, color, userValue = null, xMin, xMax, yMin = 0.7, yMax = 2.5, yType = 'logarithmic') => {
    if (!ctx) return null;
    const eqMap = { 'Resting Heart Rate (bpm)': rrRHR_J, 'Systolic BP (mmHg)': sbpEquation, 'Diastolic BP (mmHg)': dbpEquation };
    const equation = eqMap[label];
    let scatterDataset = [];
  
    if (userValue !== null && !isNaN(userValue) && equation) {
        const risk = equation(userValue);
        scatterDataset.push({
            type: 'scatter',
            label: 'User Value',
            data: [{ x: userValue, y: risk }],
            pointRadius: 8, pointStyle: 'rectRot', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#fff', borderWidth: 2
        });
    }
  
    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                { label: `Relative Risk - ${label}`, data: dataPoints, borderColor: color, backgroundColor: `${color}20`, fill: false, tension: 0.3, pointRadius: 0, borderWidth: 2.5 },
                { label: 'Reference HR=1.0', data: dataPoints.map(p => ({ x: p.x, y: 1 })), borderColor: '#666', borderDash: [6, 4], pointRadius: 0, borderWidth: 1, fill: false },
                ...scatterDataset // Spread the scatter dataset array (empty if no valid user value)
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: {
                y: { type: yType, title: { display: true, text: 'Relative Risk', font: { weight: 'bold' } }, min: yMin, max: yMax, ticks: { callback: v => v.toFixed(yType === 'logarithmic' ? 1 : 2) } },
                x: { type: 'linear', min: xMin, max: xMax, title: { display: true, text: label, font: { weight: 'bold' } } }
            },
            plugins: {
                 scatterOnTop: true, // Use the registered plugin
                 legend: { display: false },
                 tooltip: { callbacks: { label: tCtx => ` ${label}: ${tCtx.parsed.x.toFixed(0)}, Risk: ${tCtx.parsed.y.toFixed(2)}x` } }
             }
        }
    });
  };
  
  
  // --- Grip Strength Calculation Logic ---
  
  /* 1.  β & pivot table from Rantanen -------------------------------- */
  const RANTANEN = {
    M:[ {max:54,β:0.035,P:40},
        {max:64,β:0.028,P:40},
        {max:150,β:0.024,P:35} ],
    F:[ {max:54,β:0.043,P:25},
        {max:64,β:0.029,P:25},
        {max:150,β:0.022,P:20} ]
  };
  // Helper function to find the correct coefficients based on sex and age
  function coeffs(sex, age) {
      // Ensure sex is 'M' or 'F'
      const validSex = (String(sex).toUpperCase().startsWith('F')) ? 'F' : 'M';
      const ageNum = parseInt(age);
      if (isNaN(ageNum)) {
          console.warn("coeffs: Invalid age provided", age);
          // Return default coeffs (e.g., middle band for Male) if age is invalid, or handle error appropriately
          return RANTANEN['M'][1];
      }
      // Find the matching age band or use the last one as fallback
      return RANTANEN[validSex].find(r => ageNum <= r.max) || RANTANEN[validSex][RANTANEN[validSex].length - 1];
  }
  
  
  /* 2.  Relative-risk function – symmetrical exponential ------------- */
  const FLOOR = 0.45;                    // Empirical minimum RR
  function rrGrip(grip, sex, age) {
      const gripNum = parseFloat(grip);
      if (isNaN(gripNum)) {
          console.warn("rrGrip: Invalid grip value provided", grip);
          return NaN; // Or handle appropriately
      }
      const { β, P } = coeffs(sex, age); // Get coefficients for the given sex and age
      // Calculate relative risk, ensuring it doesn't go below the floor
      return Math.max(Math.exp(β * (P - gripNum)), FLOOR);
  }
  
  
  // --- Functional Strength Score Charting ---
  // (Uses annotation plugin, ensure it's loaded separately)
  
  /**
   * Updates the RMR comparison visualization with data from measured and predicted RMR.
   * Shows the difference between measured and predicted RMR using a colored scale.
   */
  function updateRMRComparisonVisualization() {
    // Get the predicted and measured RMR values from localStorage
    const predictedRMRStr = localStorage.getItem('rmr');
    const measuredRMRStr = localStorage.getItem('measured_rmr');
    console.log('Parsed RMR values:', { predictedRMRStr, measuredRMRStr }); // <-- Add this line
  
    // Clean and parse the values
    const predictedRMR = parseFloat(String(predictedRMRStr).replace(/[^0-9.]/g, ''));
    const measuredRMR = parseFloat(String(measuredRMRStr).replace(/[^0-9.]/g, ''));
  
    // Check if both values are valid numbers
    if (isNaN(predictedRMR) || isNaN(measuredRMR) || predictedRMR === 0) {
      console.warn('Invalid RMR values for comparison visualization:', { predictedRMR, measuredRMR });
      document.getElementById('percentDiff').textContent = 'Insufficient data for comparison';
      return;
    }
  
    // Calculate the percentage difference
    const diff = ((measuredRMR - predictedRMR) / predictedRMR) * 100;
  
    // Update the percentage difference display
    const percentDiffEl = document.getElementById('percentDiff');
    if (percentDiffEl) {
      percentDiffEl.textContent = `Measured RMR is ${Math.abs(diff).toFixed(1)}% ${diff >= 0 ? 'higher' : 'lower'} than predicted`;
    }
  
    // Determine which segment to highlight based on the difference
    let highlightIndex;
    if (diff <= -31)      highlightIndex = 0; // Much Lower
    else if (diff <= -16) highlightIndex = 1; // Lower
    else if (diff <= 15)  highlightIndex = 2; // Within Range
    else if (diff <= 30)  highlightIndex = 3; // Higher
    else                  highlightIndex = 4; // Much Higher
  
    // Highlight the appropriate segment
    for (let i = 0; i < 5; i++) {
      const segmentEl = document.getElementById(`seg${i}`);
      if (segmentEl) {
        if (i === highlightIndex) {
          segmentEl.classList.add('highlight');
        } else {
          segmentEl.classList.remove('highlight');
        }
      }
    }
  }
  
  
  // ==========================================================================
  // ========== MAIN DOM CONTENT LOADED LISTENER ==============================
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing report data and charts...");
  
    // --- Populate Form Fields ---
  
    // Page 1: Meta Info
    const firstName = localStorage.getItem('first_name') || '';
    const lastName = localStorage.getItem('last_name') || '';
    const clientNameElement = document.getElementById('clientName');
    if (clientNameElement) {
        // Fix: Change .value to .textContent for div element
        clientNameElement.textContent = `${firstName} ${lastName}`.trim() || 'N/A';
    }
    populateField('examDate', 'exam_date', { formatter: formatDate });
  
  
  
  
    // Page 2: Summary Table (Value Fields)
    populateField('summaryBmiValue', 'bmi');
  
  
  
  
  
  
    populateField('summaryFmiValue', 'fat_mass_index');
  
  
  
  
  
  
    populateField('summaryFfmiValue', 'fat_free_mass_index');
  
  
  
  
  
  
    populateField('summaryGripValue', 'grip_strength_avg');
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    populateField('summaryRhrValue', 'resting_hr');
  
  
  
  
  
  
    populateField('summarySbpValue', 'sbp_mmhg');
  
  
  
  
  
  
    populateField('summaryDbpValue', 'dbp_mmhg');
  
  
  
  
  
  
    populateField('summaryFssValue', 'total_strength_score');
  
  
  
  
  
  
    // Summary RMR: Prioritize Measured over Predicted
    const measuredRMR = localStorage.getItem('measured_rmr');
    const predictedRMR = localStorage.getItem('rmr');
    const summaryRmrElement = document.getElementById('summaryRmrValue');
  
  
  
  
  
  
    if (summaryRmrElement) {
        const rmrValue = (measuredRMR && String(measuredRMR).trim() !== '')
            ? String(measuredRMR).replace(/ kcal\/day/gi, '').trim()
            : (predictedRMR ? String(predictedRMR).replace(/ kcal\/day/gi, '').trim() : 'N/A');
        summaryRmrElement.value = rmrValue;
    }
  
  
  
  
  
  
  
  
  
  
    // Summary VO2 Max, METs, Percentile, and Note
    const gender = localStorage.getItem('gender');
    const ageStr = localStorage.getItem('age');
    const unifiedVO2Max = localStorage.getItem('unified_vo2max');
    const vo2ValueClean = unifiedVO2Max ? String(unifiedVO2Max).replace(/ ml\/kg\/min/gi, '').trim() : '';
    const vo2ValueNum = parseFloat(vo2ValueClean);
    const ageNum = parseInt(ageStr);
    const vo2MetsNum = !isNaN(vo2ValueNum) ? vo2ValueNum / 3.5 : NaN; // vo2MetsNum is now defined
  
  
  
    if (vo2ValueClean && !isNaN(vo2ValueNum) && vo2ValueNum > 0) {
        populateField('summaryVo2Value', 'unified_vo2max'); // Populates the value field
        populateField('tableVo2Value', 'unified_vo2max');   // Populates table value
  
        const metsValue = (vo2ValueNum / 3.5).toFixed(1);
        const metsElement = document.getElementById('tableVo2Mets');
        if (metsElement) metsElement.value = metsValue;
  
        // Calculate percentile only if age and gender are valid
        let percentile = 'N/A';
        let percentileNote = 'N/A';
        if (gender && !isNaN(ageNum)) {
           percentile = calculateVo2Percentile(gender, ageNum, vo2ValueNum);
           if (percentile === ">99.9") {
               percentileNote = ">99.9%ile";
           } else if (percentile !== 'N/A') {
               percentileNote = `${percentile}%ile`;
           }
        } else {
            console.warn("Cannot calculate VO2 percentile due to missing/invalid gender or age.");
        }
  
        const percentileElement = document.getElementById('tableVo2Percentile');
        if (percentileElement) percentileElement.value = percentile;
        const noteElement = document.getElementById('summaryVo2Note');
        if (noteElement) noteElement.value = percentileNote;
  
    } else {
        // Set all VO2 related fields to N/A if base value is missing/invalid
        ['summaryVo2Value', 'tableVo2Value', 'tableVo2Mets', 'tableVo2Percentile', 'summaryVo2Note'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = 'N/A';
        });
         if (!unifiedVO2Max) console.warn("VO2 Max data ('unified_vo2max') not found in localStorage.");
         else console.warn(`Invalid VO2 Max value found: "${unifiedVO2Max}"`);
    }
  
    // Heart Rate Recovery calculation
    const endingHRStr = localStorage.getItem('hr_bpm'); // Assuming this is peak HR during test
    const postHRStr = localStorage.getItem('post_heart_rate'); // HR after 1 min recovery
    const endingHR = parseFloat(endingHRStr);
    const postHR = parseFloat(postHRStr);
    const hrrElement = document.getElementById('summaryHrrValue');
  
  
  
    if (hrrElement) {
        if (!isNaN(endingHR) && !isNaN(postHR)) {
            hrrElement.value = (endingHR - postHR).toFixed(0);
            // Note logic could be added here based on the calculated HRR value
            // populateField('summaryHrrNote', calculatedNoteKey);
        } else {
            hrrElement.value = 'N/A';
            // populateField('summaryHrrNote', 'defaultOrNAKey');
        }
    }
  
    // Summary Notes (These likely depend on logic based on the values - using placeholder keys)
    // Replace 'bmi_note_key' etc., with actual localStorage keys if notes are stored directly,
    // OR implement logic here to determine the note based on the value and populate.
    populateField('summaryBmiNote', 'bmi_note_key', { defaultValue: 'N/A' });
    populateField('summaryFmiNote', 'fmi_note_key', { defaultValue: 'N/A' });
    populateField('summaryFfmiNote', 'ffmi_note_key', { defaultValue: 'N/A' });
    populateField('summaryGripNote', 'grip_note_key', { defaultValue: 'N/A' });
    populateField('summaryRhrNote', 'rhr_note_key', { defaultValue: 'N/A' });
    populateField('summaryRmrNote', 'rmr_note_key', { defaultValue: 'N/A' }); // Note based on measured/predicted?
    populateField('summarySbpNote', 'sbp_note_key', { defaultValue: 'N/A' });
    populateField('summaryDbpNote', 'dbp_note_key', { defaultValue: 'N/A' });
    populateField('summaryFssNote', 'fss_note_key', { defaultValue: 'N/A' });
  
    // Page 3: BMI Graph Input
    // Hidden input for potential backend use
    populateField('graphBmi', 'bmi');
    // Visible input for user feedback / potential editing
    const bmiForChartInput = document.getElementById('bmi-input'); // Assuming this ID exists
    if (bmiForChartInput) {
        populateField('bmi-input', 'bmi');
    }
  
    // Page 4: FMI/FFMI Graph Inputs (Hidden)
  
  
    populateField('graphFmi', 'fat_mass_index');
    populateField('graphFfmi', 'fat_free_mass_index');
  
    // Page 5: BP Graph Inputs (Hidden)
    populateField('graphSbp', 'sbp_mmhg');
    populateField('graphDbp', 'dbp_mmhg');
  
    // Page 6: RHR Graph Input (Hidden)
    populateField('graphRhr', 'resting_hr');
  
    // Page 7: RMR Graph & Table
    // Use measured if available, otherwise predicted, for the graph input
    const rmrGraphValue = (measuredRMR && String(measuredRMR).trim() !== '') ? measuredRMR : predictedRMR;
    const graphRmrMeasuredElement = document.getElementById('graphRmrMeasured');
    if (graphRmrMeasuredElement) {
         graphRmrMeasuredElement.value = rmrGraphValue ? String(rmrGraphValue).replace(/ kcal\/day/gi, '').trim() : 'N/A';
    }
    populateField('tableRmrPredicted', 'rmr'); // Predicted RMR
    populateField('tableRmrMeasured', 'measured_rmr'); // Measured RMR
    populateField('tableRmrFatPercent', 'fat_calories_percent');
    populateField('tableRmrCarbPercent', 'carb_calories_percent');
    populateField('tableTargetLossCons', 'weight_loss_conservative');
    populateField('tableTargetLossAggr', 'weight_loss_aggressive');
    populateField('tableTargetGainCons', 'weight_gain_conservative');
    populateField('tableTargetGainAggr', 'weight_gain_aggressive');
  
    // *** ADD THIS LINE ***
    updateRMRComparisonVisualization(); // Call the function to update the RMR bar
  
    // Page 8: VO2 Max Graph & Table (Values populated earlier in VO2 section)
  
    // Page 9: Grip Strength Graph Inputs (Hidden)
    populateField('graphGripRight', 'grip_strength_right');
    populateField('graphGripLeft', 'grip_strength_left');
    populateField('graphGripAvg', 'grip_strength_avg');
  
    // Page 10: Functional Strength Scores Graph Inputs (Hidden)
    populateField('graphUpperScore', 'upper_strength_score');
    populateField('graphLowerScore', 'lower_strength_score');
    populateField('graphCoreScore', 'core_strength_score');
    populateField('graphTotalScore', 'total_strength_score');
  
    // Page 11: Rep Max Table
    const bench10rmStr = localStorage.getItem('bench_10rm');
    const pulldown10rmStr = localStorage.getItem('pulldown_10rm');
    const deadlift10rmStr = localStorage.getItem('dl_10rm');
  
    // Calculate rep maxes (function handles NaN/missing input)
    const benchRepMaxes = calculateRepMaxes(bench10rmStr);
    const pulldownRepMaxes = calculateRepMaxes(pulldown10rmStr);
    const deadliftRepMaxes = calculateRepMaxes(deadlift10rmStr);
  
    const repMaxTable = document.querySelector('.page:nth-of-type(11) .table-wrapper table'); // Adjust selector if needed
  
  
  
  
  
  
  
  
  
  
    if (repMaxTable) {
        // Start from row 1 to skip header row (index 0)
  
        for (let i = 1; i <= 15; i++) {
            const row = repMaxTable.rows[i];
            if (row && row.cells.length >= 4) { // Check row and cell count
                const benchInput = row.cells[1].querySelector('input');
                const pulldownInput = row.cells[2].querySelector('input');
                const deadliftInput = row.cells[3].querySelector('input');
  
                if (benchInput) benchInput.value = benchRepMaxes[i - 1]; // Array is 0-indexed
                if (pulldownInput) pulldownInput.value = pulldownRepMaxes[i - 1];
                if (deadliftInput) deadliftInput.value = deadliftRepMaxes[i - 1];
            } else if (row) {
                 console.warn(`Rep Max Table: Row ${i} does not have enough cells or is missing.`);
            }
        }
        // Specifically populate the 10RM input fields from original localStorage data
        populateField('repmax10Bench', 'bench_10rm');
        populateField('repmax10Pulldown', 'pulldown_10rm');
        populateField('repmax10Deadlift', 'dl_10rm');
    } else {
        console.warn("Rep Max Table not found using the provided selector.");
    }
  
    // Page 12: Nutrition Targets Table
    populateField('nutritionEnergy', 'target_energy');
    populateField('nutritionProtein', 'protein_grams');
    populateField('nutritionCarbs', 'carb_grams');
    populateField('nutritionFat', 'fat_grams');
    populateField('nutritionFiber', 'fiber_grams');
    populateField('nutritionFluid', 'fluid_total');
  
    // Populate dietary assumptions with defaults
    const proteinValue = localStorage.getItem('protein') || '1.2'; // Default g/kg
    const proteinTargetEl = document.getElementById('nutritionProteinTarget');
    if (proteinTargetEl) proteinTargetEl.value = proteinValue;
  
    const fatValueStr = localStorage.getItem('fat') || '0.3'; // Default % as decimal
    const fatValue = parseFloat(fatValueStr);
    const fatPercentage = !isNaN(fatValue) ? (fatValue * 100).toFixed(0) : '30'; // Default %
    const fatTargetEl = document.getElementById('nutritionFatTarget');
    if (fatTargetEl) fatTargetEl.value = fatPercentage;
  
  
    // --- Initialize Charts ---
    console.log("Initializing charts...");
  
  
  
  
  
  
  
    // BMI Charts
    let bmiCharts = []; // Initialize array to hold chart instances and their functions
    const savedBmi = parseFloat(localStorage.getItem('bmi'));
    const mortChartAllEl = document.getElementById('mortChartAll');
    const mortChartCommEl = document.getElementById('mortChartComm');
    const mortChartNcdEl = document.getElementById('mortChartNcd');
  
    if (mortChartAllEl && mortChartCommEl && mortChartNcdEl) {
        const chartAll = buildBmiChart('mortChartAll', hrAll, 'crimson', savedBmi);
        const chartComm = buildBmiChart('mortChartComm', hrCD, 'royalblue', savedBmi);
        const chartNcd = buildBmiChart('mortChartNcd', hrNCD, 'seagreen', savedBmi);
  
        if (chartAll) bmiCharts.push({ chart: chartAll, fn: hrAll });
        if (chartComm) bmiCharts.push({ chart: chartComm, fn: hrCD });
        if (chartNcd) bmiCharts.push({ chart: chartNcd, fn: hrNCD });
  
        // Initial update with the saved BMI value
        updateBmiCharts(bmiCharts, savedBmi); // Function handles NaN/invalid BMI
  
        // Optional: Add listener to update charts if the visible BMI input changes
        if (bmiForChartInput) {
             bmiForChartInput.addEventListener('input', (e) => {
                 const newBmi = parseFloat(e.target.value);
                 updateBmiCharts(bmiCharts, newBmi);
             });
        }
  
    } else {
        console.warn("One or more BMI chart canvas elements not found. BMI charts not initialized.");
    }
  
    // FMI/FFMI Charts
    const xsFMI = Array.from({ length: 201 }, (_, i) => i * 0.1);
    const xsFFMI = Array.from({ length: 161 }, (_, i) => 12 + i * 0.1);
    const fmiCurve = xsFMI.map(x => ({ x: x, y: hrFMI(x) }));
    const ffmiCurve = xsFFMI.map(x => ({ x: x, y: hrFFMI(x) }));
    const fmiChartElement = document.getElementById('fmiChart');
    const ffmiChartElement = document.getElementById('ffmiChart');
    let fmiChart = null;
    let ffmiChart = null;
  
    if (fmiChartElement && ffmiChartElement) {
        fmiChart = buildFmiffmiChart(fmiChartElement, fmiCurve, 'FMI HR', 'crimson', 0, 20);
        ffmiChart = buildFmiffmiChart(ffmiChartElement, ffmiCurve, 'FFMI HR', 'teal', 12, 28); // Typo fixed: ffmiCurve used
  
        const userFMI = parseFloat(localStorage.getItem('fat_mass_index'));
        const userFFMI = parseFloat(localStorage.getItem('fat_free_mass_index'));
  
        updateFmiffmiChart(fmiChart, userFMI, hrFMI);
        updateFmiffmiChart(ffmiChart, userFFMI, hrFFMI);
    } else {
        console.warn("FMI or FFMI chart canvas element not found. Charts not initialized.");
    }
  
    // BP & RHR Charts
    const rhrData = genData([30, 120], 0.5, rrRHR_J);
    const sbpData = genData([90, 200], 0.5, sbpEquation);
    const dbpData = genData([50, 120], 0.5, dbpEquation);
    const userRHR = parseFloat(localStorage.getItem('resting_hr'));
    const userSBP = parseFloat(localStorage.getItem('sbp_mmhg'));
    const userDBP = parseFloat(localStorage.getItem('dbp_mmhg'));
    const sbpChartEl = document.getElementById('sbpChart');
    const dbpChartEl = document.getElementById('dbpChart');
    const rhrChartEl = document.getElementById('rhrChart');
  
    if (sbpChartEl) createRiskCurveChart(sbpChartEl.getContext('2d'), 'Systolic BP (mmHg)', sbpData, '#d9534f', userSBP, 110, 180); else console.warn("SBP chart canvas not found.");
    if (dbpChartEl) createRiskCurveChart(dbpChartEl.getContext('2d'), 'Diastolic BP (mmHg)', dbpData, '#5cb85c', userDBP, 65, 110); else console.warn("DBP chart canvas not found.");
    if (rhrChartEl) createRiskCurveChart(rhrChartEl.getContext('2d'), 'Resting Heart Rate (bpm)', rhrData, '#428bca', userRHR, 40, 110); else console.warn("RHR chart canvas not found.");
  
  
    // Grip Strength Chart
    const gripAge = parseInt(ageStr); // Attempt to parse
    const isAgeValid = ageStr && !isNaN(gripAge); // Check if age exists and is a valid number
  
    const gripChartEl = document.getElementById('gripChart');
    const gripContainer = gripChartEl ? gripChartEl.closest('.graph-container') : null; // Find the container
  
    if (gripChartEl && gripContainer) {
        if (isAgeValid) {
            // Age is valid, proceed with chart creation
            console.log(`Initializing Grip Strength chart for age: ${gripAge}`);
            const gripSex = (localStorage.getItem('gender') || 'MALE').toUpperCase().startsWith('F') ? 'F' : 'M';
            const userGripAvg = parseFloat(localStorage.getItem('grip_strength_avg'));
            const xs_grip = Array.from({ length: 111 }, (_, i) => 10 + i); // Grip range 10-120
  
            // *** Use the rrGrip function defined above ***
            const gripCurve = xs_grip.map(x => ({ x: x, y: rrGrip(x, gripSex, gripAge) }));
  
            let gripScatterDataset = [];
            if (!isNaN(userGripAvg)) {
                // *** Use the rrGrip function defined above for the user point ***
                const userRisk = rrGrip(userGripAvg, gripSex, gripAge);
                if (!isNaN(userRisk)) { // Check if risk calculation was successful
                    gripScatterDataset.push({
                        type: 'scatter',
                        label: 'User Avg Grip',
                        data: [{ x: userGripAvg, y: userRisk }],
                        pointRadius: 8, pointStyle: 'rectRot', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#fff', borderWidth: 2
                    });
                } else {
                    console.warn(`Could not calculate risk for user grip average: ${userGripAvg}`);
                }
            }
  
            new Chart(gripChartEl, {
                type: 'line',
                data: {
                    datasets: [
                        { label: 'Grip Strength RR', data: gripCurve, borderColor: '#0074D9', borderWidth: 2, tension: 0.5, pointRadius: 0, spanGaps: true },
                        { label: 'Reference RR=1.0', data: xs_grip.map(x => ({ x: x, y: 1 })), borderColor: '#666', borderDash: [6, 4], pointRadius: 0 },
                        ...gripScatterDataset
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, animation: false,
                    plugins: { scatterOnTop: true, legend: { display: false } },
                    scales: {
                        x: { type: 'linear', min: 10, max: 65, title: { display: true, text: 'Grip strength (kg)' } },
                        // Use the FLOOR constant defined above for the minimum y-axis value
                        y: { type: 'linear', min: FLOOR - 0.05, max: 3.0, title: { display: true, text: 'Relative risk (All-Cause Mortality)' } }
                    }
                }
            });
        } else {
            // Age is missing or invalid, display message instead of chart
            console.warn("Grip Strength chart not generated: Age data missing or invalid.");
            gripChartEl.style.display = 'none'; // Hide the canvas element
            const messageElement = document.createElement('p');
            messageElement.textContent = 'Age data is missing or invalid. Grip strength chart requires age to be calculated.';
            messageElement.style.textAlign = 'center';
            messageElement.style.padding = '20px';
            messageElement.style.color = '#cc0000'; // Warning color
            const canvasContainer = gripChartEl.parentElement;
            if (canvasContainer) {
                canvasContainer.appendChild(messageElement);
            } else {
                gripContainer.appendChild(messageElement);
            }
        }
    } else {
        if (!gripChartEl) console.warn("Grip Strength chart canvas element 'gripChart' not found.");
        if (!gripContainer) console.warn("Could not find '.graph-container' for Grip Strength chart.");
    }
  
    // Functional Strength Score Chart
    const strengthChartEl = document.getElementById('strengthChart');
    if (strengthChartEl) {
        // Destroy existing chart instance if it exists (useful for hot-reloading environments)
        let existingChart = Chart.getChart(strengthChartEl);
        if (existingChart) {
            console.log("Destroying existing Functional Strength chart instance.");
            existingChart.destroy();
        }
  
        const totalStrengthScoreStr = localStorage.getItem('total_strength_score');
        const totalStrengthScore = parseFloat(totalStrengthScoreStr);
  
        // Parameters for the normal distribution
        const μ = 500; const σ = 150;
        const chartDataPoints = [];
        for (let x = 0; x <= 1000; x += 5) { // Increased step for fewer points
            const y = (1 / (σ * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - μ) / σ, 2));
            chartDataPoints.push({ x: x, y: y });
        }
  
        const ctx = strengthChartEl.getContext('2d');
        let annotationOptions = {};
  
        // Check if annotation plugin is loaded and registered
        const annotationPlugin = Chart.registry.plugins.get('annotation');
        if (!annotationPlugin) {
             console.warn("Chart.js Annotation plugin not found or not registered. Score line will not be displayed.");
        } else if (!isNaN(totalStrengthScore)) {
             console.log(`Adding annotation line for FSS score: ${totalStrengthScore}`);
             annotationOptions = { // Assign to the outer variable
                annotations: {
                    scoreLine: {
                        type: 'line',
                        xMin: totalStrengthScore,
                        xMax: totalStrengthScore,
                        borderColor: 'rgba(6, 0, 95, 0.8)', // Dark Blue, semi-transparent
                        borderWidth: 3,
                        label: {
                            content: `Your Score: ${totalStrengthScore.toFixed(0)}`,
                            enabled: true,
                            position: 'start',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            font: { size: 10 },
                            yAdjust: -10 // Adjust label position slightly above the line
                        }
                    }
                }
            };
        } else {
             console.warn("Total strength score not found or invalid. Annotation line not added.");
        }
  
        console.log("Creating new Functional Strength chart instance.");
        new Chart(ctx, {
            type: 'line',
            data: {
  
                datasets: [{
                    label: 'Expected Distribution',
                    data: chartDataPoints,
                    borderColor: '#c19962', // Gold/brown color
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: { // Fill area under the curve
                       target: 'origin',
                       above: 'rgba(193, 153, 98, 0.2)', // Light gold/brown fill
                    }
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                scales: {
                    x: { type: 'linear', min: 0, max: 1000, title: { display: true, text: 'Functional Strength Score', font: { size: 14 } }, ticks: { stepSize: 100 } },
                    y: { display: false, min: 0 } // Hide Y-axis
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    // Conditionally add annotation plugin options only if plugin is loaded
                    ...(annotationPlugin && { annotation: annotationOptions })
                }
            }
        });
  
    } else {
        console.warn("Functional Strength chart canvas element 'strengthChart' not found.");
    }
  
    // Add this code in the DOMContentLoaded event listener, after other charts init
    // but before the closing "Report initialization complete." console.log
  
    // Initialize VO2 Max Chart
    const vo2ChartElement = document.getElementById('vo2CategoryChart');
    if (vo2ChartElement) {
      const ctx = vo2ChartElement.getContext('2d');
      if (ctx && gender && !isNaN(ageNum) && !isNaN(vo2MetsNum)) {
        console.log(`Initializing VO2 Max chart for ${gender}, age ${ageNum}, VO2 METs ${vo2MetsNum.toFixed(1)}`);
        createOrUpdateVo2CategoryChart(ctx, gender, ageNum, vo2MetsNum);
      } else {
        console.warn("Cannot initialize VO2 Max chart: Missing or invalid data", {
          hasContext: !!ctx,
          gender,
          age: ageNum,
          vo2Mets: vo2MetsNum
        });
        // Display an error message on the canvas if possible
        if (ctx) {
          ctx.font = "16px Arial";
          ctx.fillStyle = "red";
          ctx.textAlign = "center";
          ctx.fillText("VO₂ Max chart requires gender, age, and VO₂ data.", 
                      vo2ChartElement.width / 2, 
                      vo2ChartElement.height / 2);
        }
      }
    } else {
      console.warn("VO2 Max chart canvas element 'vo2CategoryChart' not found.");
    }
  
    // --- Add Event Listener for PDF Button ---
    // Find the button by its actual onclick attribute or add an ID
    const pdfButton = document.querySelector('button[onclick="generatePDF()"]');
    if (pdfButton) {
        // The onclick attribute already handles the call, no extra listener needed
        // If you prefer an ID: give the button id="generatePdfButton" and uncomment below
        // pdfButton.addEventListener('click', generatePDF);
        console.log("PDF Generation button found.");
    } else {
        console.warn("PDF Generation button not found. PDF generation must be triggered manually or via existing onclick.");
    }
  
    console.log("Report initialization complete.");
  
  }); // --- End of DOMContentLoaded Listener ---