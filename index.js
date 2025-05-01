let db;

// List of all keys used for localStorage persistence
const allStorageKeys = [
    'first_name', 'last_name', 'exam_date', 'age', 'gender', 'height', 'weight',
    'bodyfat', 'sbp_mmhg', 'dbp_mmhg', 'resting_hr', 'goal', 'activity',
    'workout_calories', 'workouts_per_week', 'measured_rmr', 'grip_strength_left',
    'grip_strength_right', 'grip_strength_avg', 'bench_10rm', 'chop_10rm',
    'pulldown_10rm', 'dl_10rm', 'upper_strength_score', 'lower_strength_score',
    'core_strength_score', 'total_strength_score', 'six_min_distance', 'cooper_vo2max',
    'watts_peak_workload', 'hr_bpm', 'post_heart_rate', 'storer_vo2max', 'protein', 'fat',
    'fat_calories_percent', 'carb_calories_percent', 'weight_loss_conservative',
    'weight_loss_aggressive', 'weight_gain_conservative', 'weight_gain_aggressive',
    // Keys for calculated values saved from table/inputs (some overlap, which is fine)
    'fat_mass', 'fat_free_mass', 'fat_mass_index', 'fat_free_mass_index', 'bmi', 'rmr',
    'predicted_daily_calorie_burn', 'target_energy', 'protein_value', 'protein_grams',
    'protein_calories', 'fat_percentage', 'fat_grams', 'fat_calories', 'carb_percentage',
    'carb_grams', 'carb_calories', 'fiber_value', 'fiber_grams', 'fluid_ml_per_kg', 'fluid_total',
    // The key for the database blob itself
    'nutritionDb',
    'selected_vo2_method', 'unified_vo2max'
];


async function initDatabase() {
  const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
  const savedDb = localStorage.getItem('nutritionDb');
  if (savedDb) {
    try {
       const uInt8Array = new Uint8Array(JSON.parse(savedDb));
       db = new SQL.Database(uInt8Array);
    } catch (e) {
        console.error("Failed to load database from localStorage, creating new one.", e);
        localStorage.removeItem('nutritionDb'); // Remove corrupted data
        db = new SQL.Database();
        db.run(`CREATE TABLE IF NOT EXISTS nutrition (key TEXT PRIMARY KEY, value TEXT)`);
    }
  } else {
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS nutrition (key TEXT PRIMARY KEY, value TEXT)`);
  }
}

function saveToDatabase(key, value) {
  if (db && typeof value !== 'undefined' && value !== null) { // Ensure db is initialized and value is valid
      try {
        db.run(`INSERT OR REPLACE INTO nutrition (key, value) VALUES (?, ?)`, [key, String(value)]);
        const data = db.export();
        localStorage.setItem('nutritionDb', JSON.stringify(Array.from(data)));
      } catch (e) {
          console.error(`Failed to save key "${key}" to database:`, e);
      }
  }
  // Also save directly to localStorage as fallback/redundancy and for simpler loading
  localStorage.setItem(key, value);
}

function loadFromDatabase(key) {
   // Prefer localStorage directly as it's simpler and always updated
   let value = localStorage.getItem(key);
   if (value !== null) {
       return value;
   }

   // Fallback to trying the db if localStorage is empty (e.g., initial load after clearing but before save)
    if (db) {
        try {
            const stmt = db.prepare(`SELECT value FROM nutrition WHERE key = ?`);
            stmt.bind([key]);
            if (stmt.step()) {
                return stmt.getAsObject().value;
            }
            stmt.free(); // Free the statement
        } catch (e) {
            console.error(`Failed to load key "${key}" from database:`, e);
        }
    }
    return null; // Return null if not found anywhere
}

/**
 * Updates the appearance of user input fields.
 * Numeric inputs that are empty or invalid receive the .input-empty class.
 */
function updateInputStyles() {
  const numericInputs = ['age', 'weight', 'bodyfat', 'height', 'workout_calories', 
    'workouts_per_week', 'sbp_mmhg', 'dbp_mmhg', 'resting_hr', 'measured_rmr', 
    'grip_strength_left', 'grip_strength_right', 'bench_10rm', 'chop_10rm', 
    'pulldown_10rm', 'dl_10rm', 'upper_strength_score', 'lower_strength_score', 
    'core_strength_score', 'total_strength_score', 'six_min_distance', 
    'watts_peak_workload', 'hr_bpm', 'post_heart_rate',
    // Add new fields
    'fat_calories_percent', 'carb_calories_percent', 'weight_loss_conservative',
    'weight_loss_aggressive', 'weight_gain_conservative', 'weight_gain_aggressive'];
  
  numericInputs.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      if (elem.value === null || elem.value.trim() === "" || isNaN(parseFloat(elem.value))) {
        elem.classList.add('input-empty');
      } else {
        elem.classList.remove('input-empty');
      }
    }
  });
}

/**
 * Calculates body composition values.
 */
function calculateBodyComposition() {
  const weight = parseFloat(document.getElementById('weight').value);
  const bodyFat = parseFloat(document.getElementById('bodyfat').value);
  const height = parseFloat(document.getElementById('height').value);
  const age = parseFloat(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const computedFields = ['fat_mass', 'fat_free_mass', 'fat_mass_index', 'fat_free_mass_index', 'bmi', 'rmr'];

  // Check if ALL required inputs are valid numbers
  const inputsValid = !isNaN(weight) && !isNaN(bodyFat) && !isNaN(height) && !isNaN(age);

  if (inputsValid) {
    // Fat mass and fat-free mass (in lbs)
    const fatMass = (bodyFat / 100) * weight;
    const fatFreeMass = weight - fatMass;
    document.getElementById('fat_mass').value = fatMass.toFixed(2);
    document.getElementById('fat_free_mass').value = fatFreeMass.toFixed(2);
    ['fat_mass', 'fat_free_mass'].forEach(id => {
      const elem = document.getElementById(id);
      elem.classList.remove('calc-unavailable');
      elem.classList.add('calc-available');
    });

    // Convert weight to kg and height to cm (and then to m)
    const weightkg = weight / 2.20462; // More precise conversion factor
    const heightcm = height * 2.54;    // Correct conversion factor
    const heightm = heightcm / 100;

    // Calculate indexes and BMI (kg/m²)
    const fatMassIndex = (weightkg * (bodyFat / 100)) / (heightm * heightm);
    const fatFreeMassIndex = (weightkg * (1 - bodyFat / 100)) / (heightm * heightm);
    const bmi = weightkg / (heightm * heightm);
    document.getElementById('fat_mass_index').value = fatMassIndex.toFixed(2);
    document.getElementById('fat_free_mass_index').value = fatFreeMassIndex.toFixed(2);
    document.getElementById('bmi').value = bmi.toFixed(2);
    ['fat_mass_index', 'fat_free_mass_index', 'bmi'].forEach(id => {
      const elem = document.getElementById(id);
      elem.classList.remove('calc-unavailable');
      elem.classList.add('calc-available');
    });

    // Calculate RMR using the Mifflin-St Jeor equation
    let rmr;
    if (gender === 'male') {
      rmr = 10 * weightkg + 6.25 * heightcm - 5 * age + 5;
    } else { // female
      rmr = 10 * weightkg + 6.25 * heightcm - 5 * age - 161;
    }
    document.getElementById('rmr').value = rmr.toFixed(0);
    const rmrElem = document.getElementById('rmr');
    rmrElem.classList.remove('calc-unavailable');
    rmrElem.classList.add('calc-available');
  } else {
    // Clear computed fields and mark as unavailable
    computedFields.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.value = "";
        elem.classList.remove('calc-available');
        elem.classList.add('calc-unavailable');
      }
    });
  }
}

/**
 * Calculates the average grip strength.
 */
function calculateAverageGripStrength() {
  const leftGrip = parseFloat(document.getElementById('grip_strength_left').value);
  const rightGrip = parseFloat(document.getElementById('grip_strength_right').value);
  const avgElem = document.getElementById('grip_strength_avg');

  if (!isNaN(leftGrip) && !isNaN(rightGrip)) {
    const avgGrip = (leftGrip + rightGrip) / 2;
    avgElem.value = avgGrip.toFixed(2);
    avgElem.classList.remove('calc-unavailable');
    avgElem.classList.add('calc-available');
  } else {
    avgElem.value = "";
    avgElem.classList.remove('calc-available');
    avgElem.classList.add('calc-unavailable');
  }
}

/**
 * Performs calculations that depend on workout, activity, and nutrient data.
 */
function calculateOtherValues() {
  const workoutCalories = parseFloat(document.getElementById('workout_calories').value);
  const workoutsPerWeek = parseFloat(document.getElementById('workouts_per_week').value);
  const activity = parseFloat(document.getElementById('activity').value);
  const goalMultiplier = parseFloat(document.getElementById('goal').value);
  const rmrVal = parseFloat(document.getElementById('rmr').value); // Get calculated RMR
  const weight = parseFloat(document.getElementById('weight').value); // Needed for fluid/protein

  const predElem = document.getElementById('predicted_daily_calorie_burn');
  const tableFieldsToClear = ['target_energy', 'protein_value', 'protein_grams', 'protein_calories',
                               'fat_percentage', 'fat_grams', 'fat_calories', 'fiber_value', 'fiber_grams',
                               'carb_percentage', 'carb_grams', 'carb_calories', 'fluid_ml_per_kg', 'fluid_total'];

   // Check if ALL needed inputs for this section are valid
   const inputsValid = !isNaN(workoutCalories) && !isNaN(workoutsPerWeek) && !isNaN(activity) && !isNaN(goalMultiplier) && !isNaN(rmrVal) && !isNaN(weight);

  if (inputsValid) {
    const weeklyWorkoutCalories = workoutCalories * workoutsPerWeek;
    const averageDailyWorkoutCalories = weeklyWorkoutCalories / 7;
    const predictedDailyCalorieBurn = rmrVal * activity + averageDailyWorkoutCalories;
    const targetEnergy = predictedDailyCalorieBurn * goalMultiplier;

    predElem.value = predictedDailyCalorieBurn.toFixed(0);
    predElem.classList.remove('calc-unavailable');
    predElem.classList.add('calc-available');

    // Update table cells in the results table
    const updateTableField = (id, content) => {
      const elem = document.getElementById(id);
      if (elem) {
          elem.textContent = content;
          elem.classList.remove('calc-unavailable');
          elem.classList.add('calc-available');
      }
    };

    updateTableField('target_energy', targetEnergy.toFixed(0));

    // Protein calculations
    const proteinFactor = parseFloat(document.getElementById('protein').value);
    const weightkg = weight / 2.20462;
    updateTableField('protein_value', proteinFactor.toFixed(2) + " g/kg Body Weight"); // Corrected unit label
    const proteinGrams = weightkg * proteinFactor;
    updateTableField('protein_grams', proteinGrams.toFixed(0) + " g");
    const proteinCalories = proteinGrams * 4;
    updateTableField('protein_calories', proteinCalories.toFixed(0) + " kcal");

    // Fat calculations
    const fatPercentage = parseFloat(document.getElementById('fat').value);
    updateTableField('fat_percentage', (fatPercentage * 100).toFixed(0) + "%");
    const fatGrams = (targetEnergy * fatPercentage) / 9;
    updateTableField('fat_grams', fatGrams.toFixed(0) + " g");
    const fatCalories = fatGrams * 9;
    updateTableField('fat_calories', fatCalories.toFixed(0) + " kcal");

    // Fiber calculations
    const fiberGrams = (targetEnergy / 1000) * 14;
    updateTableField('fiber_value', "14 g/1000kcal");
    updateTableField('fiber_grams', fiberGrams.toFixed(0) + " g");

    // Carbs calculations
    const remainingCarbCalories = targetEnergy - (proteinCalories + fatCalories);
    const carbGrams = remainingCarbCalories > 0 ? remainingCarbCalories / 4 : 0;
    const carbPercentage = targetEnergy > 0 ? (remainingCarbCalories / targetEnergy) * 100 : 0;
    updateTableField('carb_percentage', carbPercentage.toFixed(2) + "%");
    updateTableField('carb_grams', carbGrams.toFixed(0) + " g");
    updateTableField('carb_calories', remainingCarbCalories.toFixed(0) + " kcal");

    // Fluid calculations
    const fluidIntake = weightkg * 40;
    updateTableField('fluid_ml_per_kg', "40 ml/kg/day");
    updateTableField('fluid_total', fluidIntake.toFixed(0) + " ml");

  } else {
    // Clear and mark calculated fields as unavailable
     if(predElem) {
        predElem.value = "";
        predElem.classList.remove('calc-available');
        predElem.classList.add('calc-unavailable');
     }
     tableFieldsToClear.forEach(id => {
      const elem = document.getElementById(id);
       if (elem) {
            elem.textContent = "";
            elem.classList.remove('calc-available');
            elem.classList.add('calc-unavailable');
       }
    });
  }

  // Calculate Cooper VO2 Max
  const sixMinDistance = parseFloat(document.getElementById('six_min_distance').value);
  const cooperElem = document.getElementById('cooper_vo2max');
  
  // Calculate Bike/Storer VO2 Max
  const watts = parseFloat(document.getElementById('watts_peak_workload').value);
  const age = parseFloat(document.getElementById('age').value);
  // weight already parsed above
  const gender = document.getElementById('gender').value;
  const storerElem = document.getElementById('storer_vo2max');
  
  // Get potential values for both methods
  let cooperVO2Max = null;
  let storerVO2Max = null;
  
  // Calculate Cooper if inputs are valid
  if (!isNaN(sixMinDistance) && sixMinDistance > 0) {
    cooperVO2Max = 35.97 * (sixMinDistance * 2) - 11.29;
  }
  
  // Calculate Storer if inputs are valid
  if (!isNaN(watts) && !isNaN(age) && !isNaN(weight) && watts > 0 && weight > 0) {
    const weightkg = weight / 2.20462;
    if (gender === 'male') {
      storerVO2Max = (10.51 * watts + 6.35 * weightkg - 10.49 * age + 519.3) / weightkg;
    } else { // female
      storerVO2Max = (9.39 * watts + 7.7 * weightkg - 5.88 * age + 136.7) / weightkg;
    }
  }
  
  // Logic for which method to display and store
  let selectedVO2Method = localStorage.getItem('selected_vo2_method') || null;
  let currentVO2Value = null;
  
  // If no method is selected yet or user has both sets of inputs, default to Storer if available
  if (!selectedVO2Method) {
    if (storerVO2Max !== null) {
      selectedVO2Method = 'storer';
    } else if (cooperVO2Max !== null) {
      selectedVO2Method = 'cooper';
    }
  }
  
  // Clear both fields first
  cooperElem.value = "";
  cooperElem.classList.remove('calc-available');
  cooperElem.classList.add('calc-unavailable');
  
  storerElem.value = "";
  storerElem.classList.remove('calc-available');
  storerElem.classList.add('calc-unavailable');
  
  // Set the selected method's value
  if (selectedVO2Method === 'storer' && storerVO2Max !== null) {
    storerElem.value = storerVO2Max.toFixed(2);
    storerElem.classList.remove('calc-unavailable');
    storerElem.classList.add('calc-available');
    currentVO2Value = storerVO2Max.toFixed(2);
  } else if (selectedVO2Method === 'cooper' && cooperVO2Max !== null) {
    cooperElem.value = cooperVO2Max.toFixed(2);
    cooperElem.classList.remove('calc-unavailable');
    cooperElem.classList.add('calc-available');
    currentVO2Value = cooperVO2Max.toFixed(2);
  }
  
  // Store the selected method and the unified VO2 max value
  if (selectedVO2Method) {
    saveToDatabase('selected_vo2_method', selectedVO2Method);
    saveToDatabase('unified_vo2max', currentVO2Value);
  }

   // Save calculated TABLE values to storage (redundant with field saves but ensures table reflects stored state)
   function saveTableValueToStorage(id) {
        const elem = document.getElementById(id);
        if (elem && elem.textContent) {
            saveToDatabase(id, elem.textContent); // Use saveToDatabase which handles both
        }
    }
   const tableValueIds = ['target_energy', 'protein_value', 'protein_grams', 'protein_calories',
                         'fat_percentage', 'fat_grams', 'fat_calories', 'carb_percentage',
                         'carb_grams', 'carb_calories', 'fiber_value', 'fiber_grams',
                         'fluid_ml_per_kg', 'fluid_total'];
   tableValueIds.forEach(saveTableValueToStorage);
}

/**
 * Main function to calculate all values and save inputs.
 */
function calculateValues() {
  updateInputStyles(); // Style inputs first based on current values
  calculateBodyComposition(); // Calculate dependent fields
  calculateAverageGripStrength(); // Calculate grip average
  calculateOtherValues(); // Calculate remaining fields including table

  // Save USER INPUT values to the database/local storage
  saveToDatabase('first_name', document.getElementById('first_name').value);
  saveToDatabase('last_name', document.getElementById('last_name').value);
  saveToDatabase('exam_date', document.getElementById('exam_date').value);
  saveToDatabase('age', document.getElementById('age').value);
  saveToDatabase('gender', document.getElementById('gender').value);
  saveToDatabase('height', document.getElementById('height').value);
  saveToDatabase('weight', document.getElementById('weight').value);
  saveToDatabase('bodyfat', document.getElementById('bodyfat').value);
  saveToDatabase('sbp_mmhg', document.getElementById('sbp_mmhg').value);
  saveToDatabase('dbp_mmhg', document.getElementById('dbp_mmhg').value);
  saveToDatabase('resting_hr', document.getElementById('resting_hr').value);
  saveToDatabase('goal', document.getElementById('goal').value);
  saveToDatabase('activity', document.getElementById('activity').value);
  saveToDatabase('workout_calories', document.getElementById('workout_calories').value);
  saveToDatabase('workouts_per_week', document.getElementById('workouts_per_week').value);
  saveToDatabase('measured_rmr', document.getElementById('measured_rmr').value);
  saveToDatabase('grip_strength_left', document.getElementById('grip_strength_left').value);
  saveToDatabase('grip_strength_right', document.getElementById('grip_strength_right').value);
  saveToDatabase('bench_10rm', document.getElementById('bench_10rm').value);
  saveToDatabase('chop_10rm', document.getElementById('chop_10rm').value);
  saveToDatabase('pulldown_10rm', document.getElementById('pulldown_10rm').value);
  saveToDatabase('dl_10rm', document.getElementById('dl_10rm').value);
  saveToDatabase('upper_strength_score', document.getElementById('upper_strength_score').value);
  saveToDatabase('lower_strength_score', document.getElementById('lower_strength_score').value);
  saveToDatabase('core_strength_score', document.getElementById('core_strength_score').value);
  saveToDatabase('total_strength_score', document.getElementById('total_strength_score').value);
  saveToDatabase('six_min_distance', document.getElementById('six_min_distance').value);
  saveToDatabase('watts_peak_workload', document.getElementById('watts_peak_workload').value);
  saveToDatabase('hr_bpm', document.getElementById('hr_bpm').value); // <-- Already present
  saveToDatabase('post_heart_rate', document.getElementById('post_heart_rate').value); // <-- Already present
  saveToDatabase('protein', document.getElementById('protein').value);
  saveToDatabase('fat', document.getElementById('fat').value);

  // Save the new field values
  saveToDatabase('fat_calories_percent', document.getElementById('fat_calories_percent').value);
  saveToDatabase('carb_calories_percent', document.getElementById('carb_calories_percent').value);
  saveToDatabase('weight_loss_conservative', document.getElementById('weight_loss_conservative').value);
  saveToDatabase('weight_loss_aggressive', document.getElementById('weight_loss_aggressive').value);
  saveToDatabase('weight_gain_conservative', document.getElementById('weight_gain_conservative').value);
  saveToDatabase('weight_gain_aggressive', document.getElementById('weight_gain_aggressive').value);

  // Save CALCULATED input values as well (so they persist on reload if inputs are present)
  saveToDatabase('fat_mass', document.getElementById('fat_mass').value);
  saveToDatabase('fat_free_mass', document.getElementById('fat_free_mass').value);
  saveToDatabase('fat_mass_index', document.getElementById('fat_mass_index').value);
  saveToDatabase('fat_free_mass_index', document.getElementById('fat_free_mass_index').value);
  saveToDatabase('bmi', document.getElementById('bmi').value);
  saveToDatabase('rmr', document.getElementById('rmr').value);
  saveToDatabase('grip_strength_avg', document.getElementById('grip_strength_avg').value);
  saveToDatabase('predicted_daily_calorie_burn', document.getElementById('predicted_daily_calorie_burn').value);
  saveToDatabase('cooper_vo2max', document.getElementById('cooper_vo2max').value);
  saveToDatabase('storer_vo2max', document.getElementById('storer_vo2max').value);
  // *** Add keys for HRR calculation ***
  saveToDatabase('peak_hr', document.getElementById('hr_bpm').value); // Save hr_bpm also as peak_hr
  saveToDatabase('hr_1min_recovery', document.getElementById('post_heart_rate').value); // Save post_heart_rate as hr_1min_recovery
  saveToDatabase('selected_vo2_method', localStorage.getItem('selected_vo2_method'));
  saveToDatabase('unified_vo2max', localStorage.getItem('unified_vo2max'));
}

/**
 * Downloads the report as a PDF file.
 */
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Create a canvas to read the image data
  const img = document.createElement('img');
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    // Draw background with reduced opacity
    ctx.globalAlpha = 0.3; // Adjust this value between 0.1-0.5 for desired transparency
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 1.0; // Reset to default

    // Get image data
    const imgData = canvas.toDataURL('image/png');

    // Add to PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    // Continue with PDF generation
    generatePDFContent(doc);
  };

  img.onerror = function() {
    console.error('Failed to load image for PDF background');
    generatePDFContent(doc); // Generate content even without background
  };

  // Ensure the path is correct relative to the HTML file or use an absolute URL
  img.src = 'background.png'; // Assumes background.png is in the same folder as the HTML
}

function generatePDFContent(doc) {
    // Ensure jsPDF and autoTable are loaded
    if (!doc || !doc.autoTable) {
        console.error("jsPDF or autoTable plugin not loaded correctly.");
        alert("Error generating PDF: Required libraries not loaded.");
        return;
    }

  // Make text content more visible with darker font
  doc.setTextColor(0, 0, 0); // Black text

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Fitomics Nutrition Calculator Report', 15, 20);

  // Get name and format it
  const firstName = document.getElementById('first_name').value || '';
  const lastName = document.getElementById('last_name').value || '';
  const fullName = (firstName + ' ' + lastName).trim();
  const examDateValue = document.getElementById('exam_date').value || '';
  let displayDate = 'N/A';
    try {
        if (examDateValue) {
         // Handle potential invalid date string before creating Date object
         // A simple check for YYYY-MM-DD format
         if (/^\d{4}-\d{2}-\d{2}$/.test(examDateValue)) {
            displayDate = new Date(examDateValue + 'T00:00:00').toLocaleDateString(); // Add time to avoid timezone issues
         } else {
             displayDate = examDateValue; // Show raw value if format is unexpected
         }
        }
    } catch (e) {
        console.error("Error formatting date:", e);
         displayDate = examDateValue || 'N/A'; // Fallback
    }


  // Add client name if available
  doc.setFontSize(14);
  doc.text(`Client: ${fullName || 'N/A'}`, 15, 30);

  // Add exam date if available
  doc.text(`Date: ${displayDate}`, 15, 37);


  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Information & Inputs', 15, 47); // Combined section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Adjust the starting Y position
  const startY = 57;
  let currentY = startY;
  const lineHeight = 7;
  const column1X = 15;
  const column2X = 105; // Adjust based on page width and desired spacing

  const inputs1 = [
    ['Age:', (document.getElementById('age').value || 'N/A') + ' years'],
    ['Gender:', document.getElementById('gender').value || 'N/A'],
    ['Height:', (document.getElementById('height').value || 'N/A') + ' inches'],
    ['Weight:', (document.getElementById('weight').value || 'N/A') + ' lbs'],
    ['Body Fat:', (document.getElementById('bodyfat').value || 'N/A') + '%'],
    ['SBP:', (document.getElementById('sbp_mmhg').value || 'N/A') + ' mmHg'],
    ['DBP:', (document.getElementById('dbp_mmhg').value || 'N/A') + ' mmHg'],
    ['Resting HR:', (document.getElementById('resting_hr').value || 'N/A') + ' bpm'],
  ];

  const inputs2 = [
     ['Goal:', document.getElementById('goal').selectedOptions[0]?.text || 'N/A'], // Get text of selected option
     ['Activity Level:', document.getElementById('activity').selectedOptions[0]?.text || 'N/A'],
     ['Workout Calories:', (document.getElementById('workout_calories').value || 'N/A') + ' kcal/session'],
     ['Workouts/Week:', document.getElementById('workouts_per_week').value || 'N/A'],
     ['Measured RMR:', (document.getElementById('measured_rmr').value || 'N/A') + ' kcal'],
     ['Protein Target:', document.getElementById('protein').selectedOptions[0]?.text || 'N/A' + ' g/kg'],
     ['Fat Target:', document.getElementById('fat').selectedOptions[0]?.text || 'N/A' + '% calories'],
  ];

  // Draw inputs in two columns
   inputs1.forEach((item) => {
       doc.text(`${item[0]} ${item[1]}`, column1X, currentY);
       currentY += lineHeight;
   });

    currentY = startY; // Reset Y for the second column
    inputs2.forEach((item) => {
       doc.text(`${item[0]} ${item[1]}`, column2X, currentY);
       currentY += lineHeight;
   });


  // Results Section (move it down)
  const resultsStartY = currentY + 5; // Start below the longest input column
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculated Results & Recommendations', 15, resultsStartY);

  // Add table for results
  doc.autoTable({
    startY: resultsStartY + 5, // Space after title
    head: [['Metric', 'Value', 'Amount', 'Calories']],
    body: [
      ['BMI', document.getElementById('bmi').value || 'N/A', '', ''],
      ['Fat Mass', (document.getElementById('fat_mass').value || 'N/A') + ' lbs', '', ''],
      ['Fat-Free Mass', (document.getElementById('fat_free_mass').value || 'N/A') + ' lbs', '', ''],
      ['Fat Mass Index', (document.getElementById('fat_mass_index').value || 'N/A') + ' kg/m²', '', ''],
      ['Fat-Free Mass Index', (document.getElementById('fat_free_mass_index').value || 'N/A') + ' kg/m²', '', ''],
      ['Estimated RMR', (document.getElementById('rmr').value || 'N/A') + ' kcal', '', ''],
      ['Measured RMR', (document.getElementById('measured_rmr').value || 'N/A') + ' kcal', '', ''],
      ['% Calories from Fat', (document.getElementById('fat_calories_percent').value || 'N/A') + '%', '', ''],
      ['% Calories from Carbohydrate', (document.getElementById('carb_calories_percent').value || 'N/A') + '%', '', ''],
      ['Conservative Weight Loss Target', (document.getElementById('weight_loss_conservative').value || 'N/A') + ' kcal/day', '', ''],
      ['Aggressive Weight Loss Target', (document.getElementById('weight_loss_aggressive').value || 'N/A') + ' kcal/day', '', ''],
      ['Conservative Weight Gain Target', (document.getElementById('weight_gain_conservative').value || 'N/A') + ' kcal/day', '', ''],
      ['Aggressive Weight Gain Target', (document.getElementById('weight_gain_aggressive').value || 'N/A') + ' kcal/day', '', ''],
      ['Predicted Daily Burn', (document.getElementById('predicted_daily_calorie_burn').value || 'N/A') + ' kcal', '', ''],
      ['Target Energy', document.getElementById('target_energy').textContent || 'N/A', '', ''],
      ['Protein', document.getElementById('protein_value').textContent || 'N/A',
       document.getElementById('protein_grams').textContent || 'N/A',
       document.getElementById('protein_calories').textContent || 'N/A'],
      ['Fat', document.getElementById('fat_percentage').textContent || 'N/A',
       document.getElementById('fat_grams').textContent || 'N/A',
       document.getElementById('fat_calories').textContent || 'N/A'],
      ['Carbs', document.getElementById('carb_percentage').textContent || 'N/A',
       document.getElementById('carb_grams').textContent || 'N/A',
       document.getElementById('carb_calories').textContent || 'N/A'],
      ['Fiber', document.getElementById('fiber_value').textContent || 'N/A',
       document.getElementById('fiber_grams').textContent || 'N/A', ''],
      ['Fluid Intake', document.getElementById('fluid_ml_per_kg').textContent || 'N/A',
       document.getElementById('fluid_total').textContent || 'N/A', '']
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 }, // Slightly smaller font for more data
    headStyles: { fillColor: [0, 59, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
     columnStyles: {
         0: { cellWidth: 60 }, // Adjust column widths as needed
         1: { cellWidth: 'auto' },
         2: { cellWidth: 'auto' },
         3: { cellWidth: 'auto' }
     },
     didDrawPage: function (data) {
        // Footer
        doc.setFontSize(8);
        var pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text(`Generated by Fitomics Nutrition Calculator on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - data.settings.margin.right - 70, doc.internal.pageSize.height - 10);
     }
  });

  // Add a new page for Physical Assessment if needed
  const physicalAssessmentStartY = doc.autoTable.previous.finalY + 10; // Position after the first table
   if (physicalAssessmentStartY > doc.internal.pageSize.height - 40) { // Check if space is tight
       doc.addPage();
        // If new page, add background again? (Optional, complex)
        // Add header on new page? (Optional)
        // doc.text('Physical Assessment Data', 15, 20); // Example header
       // Reset start Y for the new page
       // physicalAssessmentStartY = 30; // Or appropriate top margin
   }


   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Physical Assessment Data', 15, physicalAssessmentStartY);


  // Add table for Physical Assessment Data
   doc.autoTable({
        startY: physicalAssessmentStartY + 5,
        head: [['Measurement', 'Value']],
        body: [
            ['Grip Strength Left', (document.getElementById('grip_strength_left').value || 'N/A') + ' kg'],
            ['Grip Strength Right', (document.getElementById('grip_strength_right').value || 'N/A') + ' kg'],
            ['Grip Strength Avg', (document.getElementById('grip_strength_avg').value || 'N/A') + ' kg'],
            ['10RM - Bench', (document.getElementById('bench_10rm').value || 'N/A') + ' lbs'],
            ['10RM - Chop', (document.getElementById('chop_10rm').value || 'N/A') + ' lbs'],
            ['10RM - Pulldown', (document.getElementById('pulldown_10rm').value || 'N/A') + ' lbs'],
            ['10RM - DL', (document.getElementById('dl_10rm').value || 'N/A') + ' lbs'],
            ['Upper Strength Score', (document.getElementById('upper_strength_score').value || 'N/A') + ' %ile'],
            ['Lower Strength Score', (document.getElementById('lower_strength_score').value || 'N/A') + ' %ile'],
            ['Core Strength Score', (document.getElementById('core_strength_score').value || 'N/A') + ' %ile'],
            ['Total Strength Score', (document.getElementById('total_strength_score').value || 'N/A') + ' %ile'],
            ['6 min Distance', (document.getElementById('six_min_distance').value || 'N/A') + ' miles'],
            ['Cooper VO2 Max', (document.getElementById('cooper_vo2max').value || 'N/A') + ' ml/kg/min'],
            ['Watts at Peak', (document.getElementById('watts_peak_workload').value || 'N/A') + ' watts'],
            ['Ending HR', (document.getElementById('hr_bpm').value || 'N/A') + ' bpm'],
            ['1-min Post HR', (document.getElementById('post_heart_rate').value || 'N/A') + ' bpm'],
            ['Bike/Storer VO2 Max', (document.getElementById('storer_vo2max').value || 'N/A') + ' ml/kg/min'],
            ['Unified VO2 Max', (loadFromDatabase('unified_vo2max') || 'N/A') + ' ml/kg/min']
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [0, 59, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 80 }, // Adjust column widths
            1: { cellWidth: 'auto' }
        },
         didDrawPage: function (data) {
            // Footer (repeated for multi-page)
            doc.setFontSize(8);
            var pageCount = doc.internal.getNumberOfPages();
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            doc.text(`Generated by Fitomics Nutrition Calculator on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - data.settings.margin.right - 70, doc.internal.pageSize.height - 10);
        }
    });


  // Save the PDF
  const safeFirstName = firstName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'client';
  const safeLastName = lastName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'report';
  const safeDate = examDateValue.replace(/-/g, '') || todayFormatted.replace(/-/g, ''); // Ensure todayFormatted is accessible or passed
  const filename = `Fitomics_Discovery_${safeLastName}_${safeFirstName}_${safeDate}.pdf`;
  doc.save(filename);
}

/**
 * Manually triggers calculation and saving, providing user feedback.
 */
function manualSave() {
    try { // Wrap in try...catch for better error handling
        calculateValues(); // Calculate and save all values

        // Create a feedback element or use an existing one
        let feedbackElem = document.getElementById('save-feedback');
        if (!feedbackElem) {
          feedbackElem = document.createElement('div');
          feedbackElem.id = 'save-feedback';
          feedbackElem.style.marginTop = '10px';
          feedbackElem.style.padding = '8px 15px';
          feedbackElem.style.borderRadius = '4px';
          feedbackElem.style.textAlign = 'center';
          feedbackElem.style.transition = 'opacity 0.5s ease-in-out';

          // Insert after the buttons (Ensure the selector is correct)
          const buttonContainer = document.querySelector('.text-center.mt-3'); // Check if this class exists on the button container
          if (buttonContainer) {
              buttonContainer.appendChild(feedbackElem);
          } else {
              console.error("Button container '.text-center.mt-3' not found for feedback message.");
              // Optionally append somewhere else as a fallback
              document.querySelector('form').appendChild(feedbackElem);
          }
        }

        // Show success message with current timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        feedbackElem.textContent = `✓ All data saved successfully at ${timeString}`;
        feedbackElem.style.backgroundColor = '#d4edda'; // Bootstrap success background
        feedbackElem.style.color = '#155724';          // Bootstrap success text
        feedbackElem.style.border = '1px solid #c3e6cb'; // Bootstrap success border
        feedbackElem.style.opacity = '1';

        // Auto-hide the message after 5 seconds
        setTimeout(() => {
          if (feedbackElem) { // Check if element still exists
              feedbackElem.style.opacity = '0';
          }
        }, 5000);

    } catch (error) {
        console.error("Error during manualSave:", error);
        // Optionally display an error message to the user
        let feedbackElem = document.getElementById('save-feedback');
         if (feedbackElem) {
            feedbackElem.textContent = `✗ Error saving data. Check console.`;
            feedbackElem.style.backgroundColor = '#f8d7da'; // Bootstrap danger background
            feedbackElem.style.color = '#721c24';          // Bootstrap danger text
            feedbackElem.style.border = '1px solid #f5c6cb'; // Bootstrap danger border
            feedbackElem.style.opacity = '1';
            // Auto-hide error message too?
             setTimeout(() => {
                if (feedbackElem) { feedbackElem.style.opacity = '0'; }
             }, 7000); // Keep error visible slightly longer
         }
    }
} // <-- Add closing brace for the function

document.addEventListener('DOMContentLoaded', async () => {
    await initDatabase(); // Initialize database first

    // Set default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${yyyy}-${mm}-${dd}`;

    // Load saved data or set defaults for INPUT fields
    document.getElementById('first_name').value = loadFromDatabase('first_name') || '';
    document.getElementById('last_name').value = loadFromDatabase('last_name') || '';
    document.getElementById('exam_date').value = loadFromDatabase('exam_date') || todayFormatted;
    document.getElementById('age').value = loadFromDatabase('age') || '';
    document.getElementById('gender').value = loadFromDatabase('gender') || 'male'; // Default
    document.getElementById('height').value = loadFromDatabase('height') || '';
    document.getElementById('weight').value = loadFromDatabase('weight') || '';
    document.getElementById('bodyfat').value = loadFromDatabase('bodyfat') || '';
    document.getElementById('sbp_mmhg').value = loadFromDatabase('sbp_mmhg') || '';
    document.getElementById('dbp_mmhg').value = loadFromDatabase('dbp_mmhg') || '';
    document.getElementById('resting_hr').value = loadFromDatabase('resting_hr') || '';
    document.getElementById('goal').value = loadFromDatabase('goal') || '1'; // Default
    document.getElementById('activity').value = loadFromDatabase('activity') || '1.1'; // Default
    document.getElementById('workout_calories').value = loadFromDatabase('workout_calories') || '';
    document.getElementById('workouts_per_week').value = loadFromDatabase('workouts_per_week') || '';
    document.getElementById('measured_rmr').value = loadFromDatabase('measured_rmr') || '';
    document.getElementById('grip_strength_left').value = loadFromDatabase('grip_strength_left') || '';
    document.getElementById('grip_strength_right').value = loadFromDatabase('grip_strength_right') || '';
    document.getElementById('bench_10rm').value = loadFromDatabase('bench_10rm') || '';
    document.getElementById('chop_10rm').value = loadFromDatabase('chop_10rm') || '';
    document.getElementById('pulldown_10rm').value = loadFromDatabase('pulldown_10rm') || '';
    document.getElementById('dl_10rm').value = loadFromDatabase('dl_10rm') || '';
    document.getElementById('upper_strength_score').value = loadFromDatabase('upper_strength_score') || '';
    document.getElementById('lower_strength_score').value = loadFromDatabase('lower_strength_score') || '';
    document.getElementById('core_strength_score').value = loadFromDatabase('core_strength_score') || '';
    document.getElementById('total_strength_score').value = loadFromDatabase('total_strength_score') || '';
    document.getElementById('six_min_distance').value = loadFromDatabase('six_min_distance') || '';
    document.getElementById('watts_peak_workload').value = loadFromDatabase('watts_peak_workload') || '';
    document.getElementById('hr_bpm').value = loadFromDatabase('hr_bpm') || '';
    document.getElementById('post_heart_rate').value = loadFromDatabase('post_heart_rate') || '';
    document.getElementById('protein').value = loadFromDatabase('protein') || '1.2'; // Default
    document.getElementById('fat').value = loadFromDatabase('fat') || '0.3'; // Default

    // Load saved data for the new fields
    document.getElementById('fat_calories_percent').value = loadFromDatabase('fat_calories_percent') || '';
    document.getElementById('carb_calories_percent').value = loadFromDatabase('carb_calories_percent') || '';
    document.getElementById('weight_loss_conservative').value = loadFromDatabase('weight_loss_conservative') || '';
    document.getElementById('weight_loss_aggressive').value = loadFromDatabase('weight_loss_aggressive') || '';
    document.getElementById('weight_gain_conservative').value = loadFromDatabase('weight_gain_conservative') || '';
    document.getElementById('weight_gain_aggressive').value = loadFromDatabase('weight_gain_aggressive') || '';

    // Initial calculation run based on loaded/default data
    calculateValues();

    // Add event listeners AFTER initial load and calculation
    document.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', (event) => {
        // No need to explicitly save here, calculateValues() handles saving
        calculateValues();
      });
     // Optional: Recalculate on keyup for number fields for more responsiveness
     if (input.type === 'number') {
         input.addEventListener('keyup', calculateValues);
     }
    });

    // Add validation for Cooper method inputs
    document.getElementById('six_min_distance').addEventListener('change', function() {
      if (this.value.trim() !== '') {
        // User is trying to use Cooper method
        document.getElementById('watts_peak_workload').value = '';
        saveToDatabase('selected_vo2_method', 'cooper');
        calculateValues();
      }
    });

    // Add validation for Storer method inputs
    document.getElementById('watts_peak_workload').addEventListener('change', function() {
      if (this.value.trim() !== '') {
        // User is trying to use Storer method
        document.getElementById('six_min_distance').value = '';
        saveToDatabase('selected_vo2_method', 'storer');
        calculateValues();
      }
    });
});

// PDF generation function (no changes needed here)
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Create a canvas to read the image data
  const img = document.createElement('img');
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    // Draw background with reduced opacity
    ctx.globalAlpha = 0.3; // Adjust this value between 0.1-0.5 for desired transparency
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 1.0; // Reset to default

    // Get image data
    const imgData = canvas.toDataURL('image/png');

    // Add to PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    // Continue with PDF generation
    generatePDFContent(doc);
  };

  img.onerror = function() {
    console.error('Failed to load image for PDF background');
    generatePDFContent(doc); // Generate content even without background
  };

  // Ensure the path is correct relative to the HTML file or use an absolute URL
  img.src = 'background.png'; // Assumes background.png is in the same folder as the HTML
}

function generatePDFContent(doc) {
    // Ensure jsPDF and autoTable are loaded
    if (!doc || !doc.autoTable) {
        console.error("jsPDF or autoTable plugin not loaded correctly.");
        alert("Error generating PDF: Required libraries not loaded.");
        return;
    }

  // Make text content more visible with darker font
  doc.setTextColor(0, 0, 0); // Black text

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Fitomics Nutrition Calculator Report', 15, 20);

  // Get name and format it
  const firstName = document.getElementById('first_name').value || '';
  const lastName = document.getElementById('last_name').value || '';
  const fullName = (firstName + ' ' + lastName).trim();
  const examDateValue = document.getElementById('exam_date').value || '';
  let displayDate = 'N/A';
    try {
        if (examDateValue) {
         // Handle potential invalid date string before creating Date object
         // A simple check for YYYY-MM-DD format
         if (/^\d{4}-\d{2}-\d{2}$/.test(examDateValue)) {
            displayDate = new Date(examDateValue + 'T00:00:00').toLocaleDateString(); // Add time to avoid timezone issues
         } else {
             displayDate = examDateValue; // Show raw value if format is unexpected
         }
        }
    } catch (e) {
        console.error("Error formatting date:", e);
         displayDate = examDateValue || 'N/A'; // Fallback
    }


  // Add client name if available
  doc.setFontSize(14);
  doc.text(`Client: ${fullName || 'N/A'}`, 15, 30);

  // Add exam date if available
  doc.text(`Date: ${displayDate}`, 15, 37);


  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Information & Inputs', 15, 47); // Combined section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Adjust the starting Y position
  const startY = 57;
  let currentY = startY;
  const lineHeight = 7;
  const column1X = 15;
  const column2X = 105; // Adjust based on page width and desired spacing

  const inputs1 = [
    ['Age:', (document.getElementById('age').value || 'N/A') + ' years'],
    ['Gender:', document.getElementById('gender').value || 'N/A'],
    ['Height:', (document.getElementById('height').value || 'N/A') + ' inches'],
    ['Weight:', (document.getElementById('weight').value || 'N/A') + ' lbs'],
    ['Body Fat:', (document.getElementById('bodyfat').value || 'N/A') + '%'],
    ['SBP:', (document.getElementById('sbp_mmhg').value || 'N/A') + ' mmHg'],
    ['DBP:', (document.getElementById('dbp_mmhg').value || 'N/A') + ' mmHg'],
    ['Resting HR:', (document.getElementById('resting_hr').value || 'N/A') + ' bpm'],
  ];

  const inputs2 = [
     ['Goal:', document.getElementById('goal').selectedOptions[0]?.text || 'N/A'], // Get text of selected option
     ['Activity Level:', document.getElementById('activity').selectedOptions[0]?.text || 'N/A'],
     ['Workout Calories:', (document.getElementById('workout_calories').value || 'N/A') + ' kcal/session'],
     ['Workouts/Week:', document.getElementById('workouts_per_week').value || 'N/A'],
     ['Measured RMR:', (document.getElementById('measured_rmr').value || 'N/A') + ' kcal'],
     ['Protein Target:', document.getElementById('protein').selectedOptions[0]?.text || 'N/A' + ' g/kg'],
     ['Fat Target:', document.getElementById('fat').selectedOptions[0]?.text || 'N/A' + '% calories'],
  ];

  // Draw inputs in two columns
   inputs1.forEach((item) => {
       doc.text(`${item[0]} ${item[1]}`, column1X, currentY);
       currentY += lineHeight;
   });

    currentY = startY; // Reset Y for the second column
    inputs2.forEach((item) => {
       doc.text(`${item[0]} ${item[1]}`, column2X, currentY);
       currentY += lineHeight;
   });


  // Results Section (move it down)
  const resultsStartY = currentY + 5; // Start below the longest input column
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculated Results & Recommendations', 15, resultsStartY);

  // Add table for results
  doc.autoTable({
    startY: resultsStartY + 5, // Space after title
    head: [['Metric', 'Value', 'Amount', 'Calories']],
    body: [
      ['BMI', document.getElementById('bmi').value || 'N/A', '', ''],
      ['Fat Mass', (document.getElementById('fat_mass').value || 'N/A') + ' lbs', '', ''],
      ['Fat-Free Mass', (document.getElementById('fat_free_mass').value || 'N/A') + ' lbs', '', ''],
      ['Fat Mass Index', (document.getElementById('fat_mass_index').value || 'N/A') + ' kg/m²', '', ''],
      ['Fat-Free Mass Index', (document.getElementById('fat_free_mass_index').value || 'N/A') + ' kg/m²', '', ''],
      ['Estimated RMR', (document.getElementById('rmr').value || 'N/A') + ' kcal', '', ''],
      ['Measured RMR', (document.getElementById('measured_rmr').value || 'N/A') + ' kcal', '', ''],
      ['% Calories from Fat', (document.getElementById('fat_calories_percent').value || 'N/A') + '%', '', ''],
      ['% Calories from Carbohydrate', (document.getElementById('carb_calories_percent').value || 'N/A') + '%', '', ''],
      ['Conservative Weight Loss Target', (document.getElementById('weight_loss_conservative').value || 'N/A') + ' kcal/day', '', ''],
      ['Aggressive Weight Loss Target', (document.getElementById('weight_loss_aggressive').value || 'N/A') + ' kcal/day', '', ''],
      ['Conservative Weight Gain Target', (document.getElementById('weight_gain_conservative').value || 'N/A') + ' kcal/day', '', ''],
      ['Aggressive Weight Gain Target', (document.getElementById('weight_gain_aggressive').value || 'N/A') + ' kcal/day', '', ''],
      ['Predicted Daily Burn', (document.getElementById('predicted_daily_calorie_burn').value || 'N/A') + ' kcal', '', ''],
      ['Target Energy', document.getElementById('target_energy').textContent || 'N/A', '', ''],
      ['Protein', document.getElementById('protein_value').textContent || 'N/A',
       document.getElementById('protein_grams').textContent || 'N/A',
       document.getElementById('protein_calories').textContent || 'N/A'],
      ['Fat', document.getElementById('fat_percentage').textContent || 'N/A',
       document.getElementById('fat_grams').textContent || 'N/A',
       document.getElementById('fat_calories').textContent || 'N/A'],
      ['Carbs', document.getElementById('carb_percentage').textContent || 'N/A',
       document.getElementById('carb_grams').textContent || 'N/A',
       document.getElementById('carb_calories').textContent || 'N/A'],
      ['Fiber', document.getElementById('fiber_value').textContent || 'N/A',
       document.getElementById('fiber_grams').textContent || 'N/A', ''],
      ['Fluid Intake', document.getElementById('fluid_ml_per_kg').textContent || 'N/A',
       document.getElementById('fluid_total').textContent || 'N/A', '']
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 }, // Slightly smaller font for more data
    headStyles: { fillColor: [0, 59, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
     columnStyles: {
         0: { cellWidth: 60 }, // Adjust column widths as needed
         1: { cellWidth: 'auto' },
         2: { cellWidth: 'auto' },
         3: { cellWidth: 'auto' }
     },
     didDrawPage: function (data) {
        // Footer
        doc.setFontSize(8);
        var pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text(`Generated by Fitomics Nutrition Calculator on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - data.settings.margin.right - 70, doc.internal.pageSize.height - 10);
     }
  });

  // Add a new page for Physical Assessment if needed
  const physicalAssessmentStartY = doc.autoTable.previous.finalY + 10; // Position after the first table
   if (physicalAssessmentStartY > doc.internal.pageSize.height - 40) { // Check if space is tight
       doc.addPage();
        // If new page, add background again? (Optional, complex)
        // Add header on new page? (Optional)
        // doc.text('Physical Assessment Data', 15, 20); // Example header
       // Reset start Y for the new page
       // physicalAssessmentStartY = 30; // Or appropriate top margin
   }


   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Physical Assessment Data', 15, physicalAssessmentStartY);


  // Add table for Physical Assessment Data
   doc.autoTable({
        startY: physicalAssessmentStartY + 5,
        head: [['Measurement', 'Value']],
        body: [
            ['Grip Strength Left', (document.getElementById('grip_strength_left').value || 'N/A') + ' kg'],
            ['Grip Strength Right', (document.getElementById('grip_strength_right').value || 'N/A') + ' kg'],
            ['Grip Strength Avg', (document.getElementById('grip_strength_avg').value || 'N/A') + ' kg'],
            ['10RM - Bench', (document.getElementById('bench_10rm').value || 'N/A') + ' lbs'],
            ['10RM - Chop', (document.getElementById('chop_10rm').value || 'N/A') + ' lbs'],
            ['10RM - Pulldown', (document.getElementById('pulldown_10rm').value || 'N/A') + ' lbs'],
            ['10RM - DL', (document.getElementById('dl_10rm').value || 'N/A') + ' lbs'],
            ['Upper Strength Score', (document.getElementById('upper_strength_score').value || 'N/A') + ' %ile'],
            ['Lower Strength Score', (document.getElementById('lower_strength_score').value || 'N/A') + ' %ile'],
            ['Core Strength Score', (document.getElementById('core_strength_score').value || 'N/A') + ' %ile'],
            ['Total Strength Score', (document.getElementById('total_strength_score').value || 'N/A') + ' %ile'],
            ['6 min Distance', (document.getElementById('six_min_distance').value || 'N/A') + ' miles'],
            ['Cooper VO2 Max', (document.getElementById('cooper_vo2max').value || 'N/A') + ' ml/kg/min'],
            ['Watts at Peak', (document.getElementById('watts_peak_workload').value || 'N/A') + ' watts'],
            ['Ending HR', (document.getElementById('hr_bpm').value || 'N/A') + ' bpm'],
            ['1-min Post HR', (document.getElementById('post_heart_rate').value || 'N/A') + ' bpm'],
            ['Bike/Storer VO2 Max', (document.getElementById('storer_vo2max').value || 'N/A') + ' ml/kg/min'],
            ['Unified VO2 Max', (loadFromDatabase('unified_vo2max') || 'N/A') + ' ml/kg/min']
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [0, 59, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 80 }, // Adjust column widths
            1: { cellWidth: 'auto' }
        },
         didDrawPage: function (data) {
            // Footer (repeated for multi-page)
            doc.setFontSize(8);
            var pageCount = doc.internal.getNumberOfPages();
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            doc.text(`Generated by Fitomics Nutrition Calculator on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - data.settings.margin.right - 70, doc.internal.pageSize.height - 10);
        }
    });


  // Save the PDF
  const safeFirstName = firstName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'client';
  const safeLastName = lastName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'report';
  const safeDate = examDateValue.replace(/-/g, '') || todayFormatted.replace(/-/g, ''); // Ensure todayFormatted is accessible or passed
  const filename = `Fitomics_Discovery_${safeLastName}_${safeFirstName}_${safeDate}.pdf`;
  doc.save(filename);
}

/**
 * Manually triggers calculation and saving, providing user feedback.
 */
function manualSave() {
    try { // Wrap in try...catch for better error handling
        calculateValues(); // Calculate and save all values

        // Create a feedback element or use an existing one
        let feedbackElem = document.getElementById('save-feedback');
        if (!feedbackElem) {
          feedbackElem = document.createElement('div');
          feedbackElem.id = 'save-feedback';
          feedbackElem.style.marginTop = '10px';
          feedbackElem.style.padding = '8px 15px';
          feedbackElem.style.borderRadius = '4px';
          feedbackElem.style.textAlign = 'center';
          feedbackElem.style.transition = 'opacity 0.5s ease-in-out';

          // Insert after the buttons (Ensure the selector is correct)
          const buttonContainer = document.querySelector('.text-center.mt-3'); // Check if this class exists on the button container
          if (buttonContainer) {
              buttonContainer.appendChild(feedbackElem);
          } else {
              console.error("Button container '.text-center.mt-3' not found for feedback message.");
              // Optionally append somewhere else as a fallback
              document.querySelector('form').appendChild(feedbackElem);
          }
        }

        // Show success message with current timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        feedbackElem.textContent = `✓ All data saved successfully at ${timeString}`;
        feedbackElem.style.backgroundColor = '#d4edda'; // Bootstrap success background
        feedbackElem.style.color = '#155724';          // Bootstrap success text
        feedbackElem.style.border = '1px solid #c3e6cb'; // Bootstrap success border
        feedbackElem.style.opacity = '1';

        // Auto-hide the message after 5 seconds
        setTimeout(() => {
          if (feedbackElem) { // Check if element still exists
              feedbackElem.style.opacity = '0';
          }
        }, 5000);

    } catch (error) {
        console.error("Error during manualSave:", error);
        // Optionally display an error message to the user
        let feedbackElem = document.getElementById('save-feedback');
         if (feedbackElem) {
            feedbackElem.textContent = `✗ Error saving data. Check console.`;
            feedbackElem.style.backgroundColor = '#f8d7da'; // Bootstrap danger background
            feedbackElem.style.color = '#721c24';          // Bootstrap danger text
            feedbackElem.style.border = '1px solid #f5c6cb'; // Bootstrap danger border
            feedbackElem.style.opacity = '1';
            // Auto-hide error message too?
             setTimeout(() => {
                if (feedbackElem) { feedbackElem.style.opacity = '0'; }
             }, 7000); // Keep error visible slightly longer
         }
    }
} // <-- Add closing brace for the function

document.addEventListener('DOMContentLoaded', async () => {
    await initDatabase(); // Initialize database first

    // Set default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${yyyy}-${mm}-${dd}`;

    // Load saved data or set defaults for INPUT fields
    document.getElementById('first_name').value = loadFromDatabase('first_name') || '';
    document.getElementById('last_name').value = loadFromDatabase('last_name') || '';
    document.getElementById('exam_date').value = loadFromDatabase('exam_date') || todayFormatted;
    document.getElementById('age').value = loadFromDatabase('age') || '';
    document.getElementById('gender').value = loadFromDatabase('gender') || 'male'; // Default
    document.getElementById('height').value = loadFromDatabase('height') || '';
    document.getElementById('weight').value = loadFromDatabase('weight') || '';
    document.getElementById('bodyfat').value = loadFromDatabase('bodyfat') || '';
    document.getElementById('sbp_mmhg').value = loadFromDatabase('sbp_mmhg') || '';
    document.getElementById('dbp_mmhg').value = loadFromDatabase('dbp_mmhg') || '';
    document.getElementById('resting_hr').value = loadFromDatabase('resting_hr') || '';
    document.getElementById('goal').value = loadFromDatabase('goal') || '1'; // Default
    document.getElementById('activity').value = loadFromDatabase('activity') || '1.1'; // Default
    document.getElementById('workout_calories').value = loadFromDatabase('workout_calories') || '';
    document.getElementById('workouts_per_week').value = loadFromDatabase('workouts_per_week') || '';
    document.getElementById('measured_rmr').value = loadFromDatabase('measured_rmr') || '';
    document.getElementById('grip_strength_left').value = loadFromDatabase('grip_strength_left') || '';
    document.getElementById('grip_strength_right').value = loadFromDatabase('grip_strength_right') || '';
    document.getElementById('bench_10rm').value = loadFromDatabase('bench_10rm') || '';
    document.getElementById('chop_10rm').value = loadFromDatabase('chop_10rm') || '';
    document.getElementById('pulldown_10rm').value = loadFromDatabase('pulldown_10rm') || '';
    document.getElementById('dl_10rm').value = loadFromDatabase('dl_10rm') || '';
    document.getElementById('upper_strength_score').value = loadFromDatabase('upper_strength_score') || '';
    document.getElementById('lower_strength_score').value = loadFromDatabase('lower_strength_score') || '';
    document.getElementById('core_strength_score').value = loadFromDatabase('core_strength_score') || '';
    document.getElementById('total_strength_score').value = loadFromDatabase('total_strength_score') || '';
    document.getElementById('six_min_distance').value = loadFromDatabase('six_min_distance') || '';
    document.getElementById('watts_peak_workload').value = loadFromDatabase('watts_peak_workload') || '';
    document.getElementById('hr_bpm').value = loadFromDatabase('hr_bpm') || '';
    document.getElementById('post_heart_rate').value = loadFromDatabase('post_heart_rate') || '';
    document.getElementById('protein').value = loadFromDatabase('protein') || '1.2'; // Default
    document.getElementById('fat').value = loadFromDatabase('fat') || '0.3'; // Default

    // Load saved data for the new fields
    document.getElementById('fat_calories_percent').value = loadFromDatabase('fat_calories_percent') || '';
    document.getElementById('carb_calories_percent').value = loadFromDatabase('carb_calories_percent') || '';
    document.getElementById('weight_loss_conservative').value = loadFromDatabase('weight_loss_conservative') || '';
    document.getElementById('weight_loss_aggressive').value = loadFromDatabase('weight_loss_aggressive') || '';
    document.getElementById('weight_gain_conservative').value = loadFromDatabase('weight_gain_conservative') || '';
    document.getElementById('weight_gain_aggressive').value = loadFromDatabase('weight_gain_aggressive') || '';

    // Initial calculation run based on loaded/default data
    calculateValues();

    // Add event listeners AFTER initial load and calculation
    document.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', (event) => {
        // No need to explicitly save here, calculateValues() handles saving
        calculateValues();
      });
     // Optional: Recalculate on keyup for number fields for more responsiveness
     if (input.type === 'number') {
         input.addEventListener('keyup', calculateValues);
     }
    });

    // Add validation for Cooper method inputs
    document.getElementById('six_min_distance').addEventListener('change', function() {
      if (this.value.trim() !== '') {
        // User is trying to use Cooper method
        document.getElementById('watts_peak_workload').value = '';
        saveToDatabase('selected_vo2_method', 'cooper');
        calculateValues();
      }
    });

    // Add validation for Storer method inputs
    document.getElementById('watts_peak_workload').addEventListener('change', function() {
      if (this.value.trim() !== '') {
        // User is trying to use Storer method
        document.getElementById('six_min_distance').value = '';
        saveToDatabase('selected_vo2_method', 'storer');
        calculateValues();
      }
    });
});