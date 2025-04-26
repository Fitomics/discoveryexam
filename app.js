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
      clientNameElement.textContent = `${firstName} ${lastName}`.trim() || 'N/A';
  }
  populateField('examDate', 'exam_date', { formatter: formatDate });
  const gender = localStorage.getItem('gender'); // Get gender once
  const ageStr = localStorage.getItem('age'); // Get age once
  const ageNum = parseInt(ageStr); // Parse age once

  // Page 2: Summary Table (Value Fields & Notes)
  populateField('summaryBmiValue', 'bmi');
  const bmiValueElement = document.getElementById('summaryBmiValue');
  const bmiNoteElement = document.getElementById('summaryBmiNote');
  if (bmiValueElement && bmiNoteElement) {
      bmiNoteElement.value = getBmiNote(bmiValueElement.value);
  } else { /* ... console warnings ... */ }

  populateField('summaryFmiValue', 'fat_mass_index');
  const fmiValueElement = document.getElementById('summaryFmiValue');
  const fmiNoteElement = document.getElementById('summaryFmiNote');
  if (fmiValueElement && fmiNoteElement) {
      fmiNoteElement.value = getFmiNote(fmiValueElement.value);
  } else { /* ... console warnings ... */ }

  populateField('summaryFfmiValue', 'fat_free_mass_index');
  const ffmiValueElement = document.getElementById('summaryFfmiValue');
  const ffmiNoteElement = document.getElementById('summaryFfmiNote');
  if (ffmiValueElement && ffmiNoteElement) {
      ffmiNoteElement.value = getFfmiNote(ffmiValueElement.value);
  } else { /* ... console warnings ... */ }

  populateField('summaryGripValue', 'grip_strength_avg');
  const gripValueElement = document.getElementById('summaryGripValue');
  const gripNoteElement = document.getElementById('summaryGripNote');
  if (gripValueElement && gripNoteElement && gender && !isNaN(ageNum)) {
      const gripAvg = parseFloat(gripValueElement.value);
      if (!isNaN(gripAvg)) {
          const gripRisk = rrGrip(gripAvg, gender, ageNum); // Calculate risk
          gripNoteElement.value = getGripNote(gripRisk); // Get note from risk
      } else {
          gripNoteElement.value = 'N/A';
      }
  } else {
      if (gripNoteElement) gripNoteElement.value = 'N/A';
      /* ... console warnings ... */
  }

  populateField('summaryRhrValue', 'resting_hr');
  const rhrValueElement = document.getElementById('summaryRhrValue');
  const rhrNoteElement = document.getElementById('summaryRhrNote');
  if (rhrValueElement && rhrNoteElement) {
      rhrNoteElement.value = getRhrNote(rhrValueElement.value);
  } else { /* ... console warnings ... */ }

  populateField('summarySbpValue', 'sbp_mmhg');
  const sbpValueElement = document.getElementById('summarySbpValue');
  const sbpNoteElement = document.getElementById('summarySbpNote');
  if (sbpValueElement && sbpNoteElement) {
      sbpNoteElement.value = getSbpNote(sbpValueElement.value);
  } else { /* ... console warnings ... */ }

  populateField('summaryDbpValue', 'dbp_mmhg');
  const dbpValueElement = document.getElementById('summaryDbpValue');
  const dbpNoteElement = document.getElementById('summaryDbpNote');
  if (dbpValueElement && dbpNoteElement) {
      dbpNoteElement.value = getDbpNote(dbpValueElement.value);
  } else { /* ... console warnings ... */ }

  populateField('summaryFssValue', 'total_strength_score');
  const fssValueElement = document.getElementById('summaryFssValue');
  const fssNoteElement = document.getElementById('summaryFssNote');
  if (fssValueElement && fssNoteElement) {
      fssNoteElement.value = getFssNote(fssValueElement.value);
  } else { /* ... console warnings ... */ }

  // Summary RMR: Prioritize Measured over Predicted & Calculate Note
  const measuredRMRStr = localStorage.getItem('measured_rmr');
  const predictedRMRStr = localStorage.getItem('rmr');
  const summaryRmrElement = document.getElementById('summaryRmrValue');
  const rmrNoteElement = document.getElementById('summaryRmrNote');
  let rmrPercentDiff = NaN;

  const measuredRMR = parseFloat(String(measuredRMRStr).replace(/[^0-9.]/g, ''));
  const predictedRMR = parseFloat(String(predictedRMRStr).replace(/[^0-9.]/g, ''));

  if (summaryRmrElement) {
      const rmrValue = (measuredRMRStr && String(measuredRMRStr).trim() !== '' && !isNaN(measuredRMR))
          ? measuredRMR.toFixed(0) // Use cleaned measured value if available and valid
          : (predictedRMRStr && !isNaN(predictedRMR) ? predictedRMR.toFixed(0) : 'N/A'); // Use cleaned predicted if available and valid
      summaryRmrElement.value = rmrValue;
  }

  if (!isNaN(measuredRMR) && !isNaN(predictedRMR) && predictedRMR !== 0) {
      rmrPercentDiff = ((measuredRMR - predictedRMR) / predictedRMR) * 100;
  }

  if (rmrNoteElement) {
      rmrNoteElement.value = getRmrNote(rmrPercentDiff); // Pass the calculated difference
  } else { /* ... console warnings ... */ }


  // Summary VO2 Max, METs, Percentile, and Note
  const unifiedVO2Max = localStorage.getItem('unified_vo2max');
  const vo2ValueClean = unifiedVO2Max ? String(unifiedVO2Max).replace(/ ml\/kg\/min/gi, '').trim() : '';
  const vo2ValueNum = parseFloat(vo2ValueClean);
  const vo2MetsNum = !isNaN(vo2ValueNum) ? vo2ValueNum / 3.5 : NaN;
  let percentile = 'N/A'; // Initialize percentile
  let percentileDisplay = 'N/A'; // For display (%ile suffix)
  let vo2CategoryNote = 'N/A'; // For the summary table note

  if (vo2ValueClean && !isNaN(vo2ValueNum) && vo2ValueNum > 0) {
      populateField('summaryVo2Value', 'unified_vo2max');
      populateField('tableVo2Value', 'unified_vo2max');
      const metsValue = vo2MetsNum.toFixed(1);
      const metsElement = document.getElementById('tableVo2Mets');
      if (metsElement) metsElement.value = metsValue;

      if (gender && !isNaN(ageNum)) {
         percentile = calculateVo2Percentile(gender, ageNum, vo2ValueNum); // Calculate raw percentile
         if (percentile === ">99.9") {
             percentileDisplay = ">99.9%ile";
         } else if (percentile !== 'N/A') {
             percentileDisplay = `${percentile}%ile`;
         }
         vo2CategoryNote = getVo2Note(percentile); // Get category note based on raw percentile
      } else { console.warn("Cannot calculate VO2 percentile/note due to missing/invalid gender or age."); }

      const percentileElement = document.getElementById('tableVo2Percentile');
      if (percentileElement) percentileElement.value = percentile; // Store raw percentile value
      const noteElement = document.getElementById('summaryVo2Note');
      if (noteElement) noteElement.value = vo2CategoryNote; // Use the category note

  } else {
      ['summaryVo2Value', 'tableVo2Value', 'tableVo2Mets', 'tableVo2Percentile', 'summaryVo2Note'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = 'N/A';
      });
      /* ... console warnings ... */
  }

  // Heart Rate Recovery calculation and Note
  const endingHRStr = localStorage.getItem('hr_bpm');
  const postHRStr = localStorage.getItem('post_heart_rate');
  const endingHR = parseFloat(endingHRStr);
  const postHR = parseFloat(postHRStr);
  const hrrElement = document.getElementById('summaryHrrValue');
  const hrrNoteElement = document.getElementById('summaryHrrNote');
  let hrrValue = NaN;

  if (hrrElement) {
      if (!isNaN(endingHR) && !isNaN(postHR)) {
          hrrValue = endingHR - postHR;
          hrrElement.value = hrrValue.toFixed(0);
      } else { hrrElement.value = 'N/A'; }
  }

  if (hrrNoteElement) {
      hrrNoteElement.value = getHrrNote(hrrValue); // Pass calculated HRR value
  } else { /* ... console warnings ... */ }


  // Remove Placeholder Summary Notes handled above
  // populateField('summaryRhrNote', 'rhr_note_key', { defaultValue: 'N/A' });
  // populateField('summaryRmrNote', 'rmr_note_key', { defaultValue: 'N/A' });
  // populateField('summarySbpNote', 'sbp_note_key', { defaultValue: 'N/A' });
  // populateField('summaryDbpNote', 'dbp_note_key', { defaultValue: 'N/A' });
  // populateField('summaryHrrNote', 'hrr_note_key', { defaultValue: 'N/A' }); // Assuming it exists in HTML now

  // --- Populate Graph Inputs & Other Tables ---
  populateField('bmi-input', 'bmi');
  populateField('graphBmi', 'bmi');
  populateField('graphFmi', 'fat_mass_index');
  populateField('graphFfmi', 'fat_free_mass_index');
  populateField('graphSbp', 'sbp_mmhg');
  populateField('graphDbp', 'dbp_mmhg');
  populateField('graphRhr', 'resting_hr');
  populateField('graphRmrMeasured', 'measured_rmr'); // For display below RMR viz
  populateField('tableRmrPredicted', 'rmr');
  populateField('tableRmrMeasured', 'measured_rmr');
  populateField('tableRmrFatPercent', 'rmr_fat_percent');
  populateField('tableRmrCarbPercent', 'rmr_carb_percent');
  populateField('tableTargetLossCons', 'target_loss_cons');
  populateField('tableTargetLossAggr', 'target_loss_aggr');
  populateField('tableTargetGainCons', 'target_gain_cons');
  populateField('tableTargetGainAggr', 'target_gain_aggr'); // Added Aggressive Gain
  populateField('graphGripRight', 'grip_strength_r');
  populateField('graphGripLeft', 'grip_strength_l');
  populateField('graphGripAvg', 'grip_strength_avg');
  populateField('graphUpperScore', 'upper_body_strength_score');
  populateField('graphLowerScore', 'lower_body_strength_score');
  populateField('graphCoreScore', 'core_strength_score');
  populateField('graphTotalScore', 'total_strength_score');
  populateField('repmax10Bench', 'bench_press_10rm');
  populateField('repmax10Pulldown', 'pulldown_10rm');
  populateField('repmax10Deadlift', 'deadlift_10rm');
  populateField('nutritionProteinTarget', 'protein_assumption');
  populateField('nutritionFatTarget', 'fat_assumption');
  populateField('nutritionEnergy', 'energy_target');
  populateField('nutritionProtein', 'protein_target');
  populateField('nutritionCarbs', 'carb_target');
  populateField('nutritionFat', 'fat_target');
  populateField('nutritionFiber', 'fiber_target');
  populateField('nutritionFluid', 'fluid_target');

  // --- Calculate and Populate Predicted Rep Maxes ---
  const bench10RM = localStorage.getItem('bench_press_10rm');
  const pulldown10RM = localStorage.getItem('pulldown_10rm');
  const deadlift10RM = localStorage.getItem('deadlift_10rm');

  const benchMaxes = calculateRepMaxes(bench10RM);
  const pulldownMaxes = calculateRepMaxes(pulldown10RM);
  const deadliftMaxes = calculateRepMaxes(deadlift10RM);

  const repMaxTable = document.querySelector('.page:has(#repmax10Bench) table'); // Find the rep max table
  if (repMaxTable) {
      const rows = repMaxTable.querySelectorAll('tr');
      // Start from row 1 (index 1) to skip header, go up to row 15 (index 15)
      for (let i = 1; i <= 15; i++) {
          if (rows[i]) { // Check if row exists
              const cells = rows[i].querySelectorAll('td input');
              if (cells.length === 3) { // Expecting 3 input cells per row
                  cells[0].value = benchMaxes[i - 1];    // Array is 0-indexed
                  cells[1].value = pulldownMaxes[i - 1];
                  cells[2].value = deadliftMaxes[i - 1];
              }
          }
      }
  }


  // --- Initialize Charts ---
  const bmiValue = parseFloat(localStorage.getItem('bmi'));
  const fmiValue = parseFloat(localStorage.getItem('fat_mass_index'));
  const ffmiValue = parseFloat(localStorage.getItem('fat_free_mass_index'));
  const sbpValue = parseFloat(localStorage.getItem('sbp_mmhg'));
  const dbpValue = parseFloat(localStorage.getItem('dbp_mmhg'));
  const rhrValue = parseFloat(localStorage.getItem('resting_hr'));
  const gripAvgValue = parseFloat(localStorage.getItem('grip_strength_avg'));

  // BMI Charts
  const bmiCharts = [
      { chart: buildBmiChart('mortChartAll', hrAll, 'crimson', bmiValue), fn: hrAll },
      { chart: buildBmiChart('mortChartComm', hrCD, 'royalblue', bmiValue), fn: hrCD },
      { chart: buildBmiChart('mortChartNcd', hrNCD, 'seagreen', bmiValue), fn: hrNCD }
  ];
  updateBmiCharts(bmiCharts, bmiValue); // Initial update

  // FMI/FFMI Charts
  const fmiData = Array.from({ length: 201 }, (_, i) => ({ x: i * 0.1, y: hrFMI(i * 0.1) }));
  const ffmiData = Array.from({ length: 161 }, (_, i) => ({ x: 12 + i * 0.1, y: hrFFMI(12 + i * 0.1) }));
  const fmiChart = buildFmiffmiChart(document.getElementById('fmiChart'), fmiData, 'FMI HR', '#ff7f0e', 0, 20);
  const ffmiChart = buildFmiffmiChart(document.getElementById('ffmiChart'), ffmiData, 'FFMI HR', '#1f77b4', 12, 28);
  if (fmiChart) updateFmiffmiChart(fmiChart, fmiValue, hrFMI);
  if (ffmiChart) updateFmiffmiChart(ffmiChart, ffmiValue, hrFFMI);

  // BP & RHR Charts
  const sbpData = genData([100, 180], 1, sbpEquation);
  const dbpData = genData([60, 110], 1, dbpEquation);
  const rhrData = genData([40, 100], 1, rrRHR_J);
  createRiskCurveChart(document.getElementById('sbpChart'), 'Systolic BP (mmHg)', sbpData, '#d62728', sbpValue, 100, 180);
  createRiskCurveChart(document.getElementById('dbpChart'), 'Diastolic BP (mmHg)', dbpData, '#9467bd', dbpValue, 60, 110);
  createRiskCurveChart(document.getElementById('rhrChart'), 'Resting Heart Rate (bpm)', rhrData, '#2ca02c', rhrValue, 40, 100);

  // Grip Strength Chart
  const gripData = genData([0, 60], 0.5, g => rrGrip(g, gender, ageNum)); // Generate data using user's gender/age
  createRiskCurveChart(document.getElementById('gripChart'), 'Grip Strength (kg)', gripData, '#8c564b', gripAvgValue, 0, 60, 0.4, 3.0, 'linear'); // Use linear scale for grip

  // Functional Strength Score Chart (Example using Bar chart)
  const upperScore = parseFloat(localStorage.getItem('upper_body_strength_score')) || 0;
  const lowerScore = parseFloat(localStorage.getItem('lower_body_strength_score')) || 0;
  const coreScore = parseFloat(localStorage.getItem('core_strength_score')) || 0;
  const totalScore = parseFloat(localStorage.getItem('total_strength_score')) || 0;
  const strengthCtx = document.getElementById('strengthChart');
  if (strengthCtx) {
      new Chart(strengthCtx, {
          type: 'bar',
          data: {
              labels: ['Upper Body', 'Lower Body', 'Core', 'Total'],
              datasets: [{
                  label: 'Strength Score',
                  data: [upperScore, lowerScore, coreScore, totalScore],
                  backgroundColor: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
                  borderWidth: 1
              }]
          },
          options: {
              indexAxis: 'y', // Horizontal bars
              responsive: true, maintainAspectRatio: false,
              scales: { x: { beginAtZero: true, max: Math.max(350, totalScore * 1.1) } }, // Adjust max based on total
              plugins: { legend: { display: false } }
          }
      });
  }

  // VO2 Category Chart
  const vo2Canvas = document.getElementById('vo2CategoryChart');
  if (vo2Canvas && typeof createVo2CategoryChart === 'function') {
      createVo2CategoryChart(vo2Canvas, gender, ageNum, vo2ValueNum);
  } else if (!vo2Canvas) {
      console.warn("Canvas element 'vo2CategoryChart' not found.");
  } else {
      console.warn("Function 'createVo2CategoryChart' not found (ensure vo2chart.js is loaded).");
  }

  // Update RMR Visualization
  updateRMRComparisonVisualization();

  console.log("Report initialization complete.");

}); // --- End of DOMContentLoaded Listener ---


/**
 * Determines the BMI category note based on the BMI value.
 * @param {number|string} bmiValue - The Body Mass Index value.
 * @returns {string} - The corresponding BMI category note or 'N/A'.
 */
function getBmiNote(bmiValue) {
    const bmi = parseFloat(bmiValue);
    if (isNaN(bmi)) {
        return 'N/A';
    }

    if (bmi < 18.5) return "Underweight";
    if (bmi <= 24.9) return "Considered Healthy";
    if (bmi <= 29.9) return "Considered Overweight";
    if (bmi <= 34.9) return "Class 1 Obesity";
    if (bmi <= 39.9) return "Class 2 Obesity";
    if (bmi >= 40.0) return "Class 3 Obesity";

    return 'N/A'; // Should not be reached if BMI is a valid number
}

/**
 * Determines the FMI category note based on the FMI value.
 * @param {number|string} fmiValue - The Fat Mass Index value.
 * @returns {string} - The corresponding FMI category note or 'N/A'.
 */
function getFmiNote(fmiValue) {
    const fmi = parseFloat(fmiValue);
    if (isNaN(fmi)) {
        return 'N/A';
    }

    if (fmi <= 2.9) return "Very Lean";
    if (fmi <= 5.0) return "Lean";
    if (fmi <= 7.6) return "Considered Healthy";
    if (fmi <= 9.1) return "Slightly Overfat";
    if (fmi <= 13.1) return "Overfat";
    if (fmi >= 13.2) return "Significantly Overfat";

    return 'N/A';
}

/**
 * Determines the FFMI category note based on the FFMI value.
 * @param {number|string} ffmiValue - The Fat-Free Mass Index value.
 * @returns {string} - The corresponding FFMI category note or 'N/A'.
 */
function getFfmiNote(ffmiValue) {
    const ffmi = parseFloat(ffmiValue);
    if (isNaN(ffmi)) {
        return 'N/A';
    }

    if (ffmi <= 14.9) return "Significantly Undermuscled";
    if (ffmi <= 18.0) return "Undermuscled";
    if (ffmi <= 22.0) return "Considered Healthy";
    if (ffmi <= 24.0) return "Muscular";
    if (ffmi >= 24.1) return "High";

    return 'N/A';
}

/**
 * Determines the Grip Strength category note based on the calculated relative risk.
 * Lower relative risk indicates stronger grip relative to peers.
 * @param {number|string} gripRelativeRisk - The calculated relative risk from rrGrip function.
 * @returns {string} - The corresponding Grip Strength category note or 'N/A'.
 */
function getGripNote(gripRelativeRisk) {
    const rr = parseFloat(gripRelativeRisk);
    if (isNaN(rr)) {
        return 'N/A';
    }

    if (rr >= 1.5) return "Weak";
    if (rr >= 1.0) return "Weaker"; // Between 1.0 and 1.49
    if (rr >= 0.8) return "Decent"; // Between 0.8 and 0.99
    if (rr >= 0.6) return "Fairly Strong"; // Between 0.6 and 0.79
    if (rr < 0.6) return "Strong"; // Below 0.6

    return 'N/A'; // Should only be reached if rr is NaN initially
}

/**
 * Determines the Functional Strength Score category note based on the total score.
 * @param {number|string} fssValue - The Total Functional Strength Score.
 * @returns {string} - The corresponding FSS category note or 'N/A'.
 */
function getFssNote(fssValue) {
    const fss = parseFloat(fssValue);
    if (isNaN(fss)) {
        return 'N/A';
    }

    if (fss <= 320) return "Needs significant improvement";
    if (fss <= 499) return "Below average strength";
    if (fss <= 669) return "Moderate strength";
    if (fss <= 949) return "High strength capability";
    if (fss >= 950) return "Excellent strength";

    return 'N/A';
}

/**
 * Determines the Heart Rate Recovery category note based on the HRR value.
 * @param {number|string} hrrValue - The Heart Rate Recovery value (beats dropped in 1 min).
 * @returns {string} - The corresponding HRR category note or 'N/A'.
 */
function getHrrNote(hrrValue) {
    const hrr = parseFloat(hrrValue);
    if (isNaN(hrr)) {
        return 'N/A';
    }

    if (hrr <= 19) return "Poor";
    if (hrr <= 29) return "Fair";
    if (hrr >= 30) return "Excellent";

    return 'N/A';
}

/**
 * Determines the Resting Heart Rate category note based on the RHR value.
 * @param {number|string} rhrValue - The Resting Heart Rate value in bpm.
 * @returns {string} - The corresponding RHR category note or 'N/A'.
 */
function getRhrNote(rhrValue) {
    const rhr = parseFloat(rhrValue);
    if (isNaN(rhr)) {
        return 'N/A';
    }

    if (rhr <= 69) return "Low risk";
    if (rhr <= 89) return "Slightly elevated risk";
    if (rhr >= 90) return "High risk";

    return 'N/A';
}

/**
 * Determines the Systolic Blood Pressure category note based on the SBP value.
 * @param {number|string} sbpValue - The Systolic Blood Pressure value in mmHg.
 * @returns {string} - The corresponding SBP category note or 'N/A'.
 */
function getSbpNote(sbpValue) {
    const sbp = parseFloat(sbpValue);
    if (isNaN(sbp)) {
        return 'N/A';
    }

    if (sbp <= 124) return "Low risk";
    if (sbp <= 144) return "Elevated risk";
    if (sbp >= 145) return "High risk";

    return 'N/A';
}

/**
 * Determines the Diastolic Blood Pressure category note based on the DBP value.
 * @param {number|string} dbpValue - The Diastolic Blood Pressure value in mmHg.
 * @returns {string} - The corresponding DBP category note or 'N/A'.
 */
function getDbpNote(dbpValue) {
    const dbp = parseFloat(dbpValue);
    if (isNaN(dbp)) {
        return 'N/A';
    }

    if (dbp <= 84) return "Low risk";
    if (dbp <= 89) return "Elevated risk";
    if (dbp >= 90) return "High risk";

    return 'N/A';
}

/**
 * Determines the VO₂ Max category note based on the percentile value.
 * @param {number|string} percentileValue - The VO₂ Max percentile (0-100 or '>99.9').
 * @returns {string} - The corresponding VO₂ Max category note or 'N/A'.
 */
function getVo2Note(percentileValue) {
    if (percentileValue === '>99.9') return "Elite"; // Handle special case first

    const percentile = parseFloat(percentileValue);
    if (isNaN(percentile)) {
        return 'N/A';
    }

    if (percentile < 25.0) return "Low";
    if (percentile < 50.0) return "Below average";
    if (percentile < 75.0) return "Above average";
    if (percentile < 97.7) return "High";
    if (percentile >= 97.7) return "Elite"; // Covers 97.7 to 99.9

    return 'N/A';
}

/**
 * Determines the RMR category note based on the percentage difference between measured and predicted RMR.
 * @param {number|string} percentDifference - The percentage difference ((measured - predicted) / predicted * 100).
 * @returns {string} - The corresponding RMR category note or 'N/A'.
 */
function getRmrNote(percentDifference) {
    const diff = parseFloat(percentDifference);
    if (isNaN(diff)) {
        return 'N/A';
    }

    if (diff < -30) return "Much Lower than Predicted"; // Less than or equal to -30 technically, but < -30 covers it
    if (diff < -15) return "Lower than Predicted"; // Between -30 and -15
    if (diff <= 14.9) return "Normal Range"; // Between -15 and 14.9
    if (diff < 30) return "Higher than Predicted"; // Between 15 and 29.9
    if (diff >= 30) return "Much Higher than Predicted";

    return 'N/A';
}