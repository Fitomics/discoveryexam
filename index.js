let db;

// List of all keys used for localStorage persistence
const allStorageKeys = [
  "first_name",
  "last_name",
  "exam_date",
  "age",
  "gender",
  "height",
  "weight",
  "bodyfat",
  "sbp_mmhg",
  "dbp_mmhg",
  "resting_hr",
  "goal",
  "activity",
  "workout_calories",
  "workouts_per_week",
  "measured_rmr",
  "grip_strength_left",
  "grip_strength_right",
  "grip_strength_avg",
  "bench_10rm",
  "chop_10rm",
  "pulldown_10rm",
  "dl_10rm",
  "upper_strength_score",
  "lower_strength_score",
  "core_strength_score",
  "total_strength_score",
  "six_min_distance",
  "cooper_vo2max",
  "watts_peak_workload",
  "hr_bpm",
  "post_heart_rate",
  "storer_vo2max",
  "protein",
  "fat",
  "fat_calories_percent",
  "carb_calories_percent",
  "weight_loss_conservative",
  "weight_loss_aggressive",
  "weight_gain_conservative",
  "weight_gain_aggressive",
  // Keys for calculated values saved from table/inputs (some overlap, which is fine)
  "fat_mass",
  "fat_free_mass",
  "fat_mass_index",
  "fat_free_mass_index",
  "bmi",
  "rmr",
  "predicted_daily_calorie_burn",
  "target_energy",
  "protein_value",
  "protein_grams",
  "protein_calories",
  "fat_percentage",
  "fat_grams",
  "fat_calories",
  "carb_percentage",
  "carb_grams",
  "carb_calories",
  "fiber_value",
  "fiber_grams",
  "fluid_ml_per_kg",
  "fluid_total",
  // The key for the database blob itself
  "nutritionDb",
  "selected_vo2_method",
  "unified_vo2max",
];

// Centralized field definitions
const fields = [
  // Basic information fields
  {
    id: "first_name",
    storageKey: "first_name",
    type: "input",
    defaultValue: "",
  },
  { id: "last_name", storageKey: "last_name", type: "input", defaultValue: "" },
  {
    id: "exam_date",
    storageKey: "exam_date",
    type: "input",
    defaultValue: "",
    special: "date",
  },
  {
    id: "age",
    storageKey: "age",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  { id: "gender", storageKey: "gender", type: "select", defaultValue: "male" },
  {
    id: "height",
    storageKey: "height",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "weight",
    storageKey: "weight",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "bodyfat",
    storageKey: "bodyfat",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "sbp_mmhg",
    storageKey: "sbp_mmhg",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "dbp_mmhg",
    storageKey: "dbp_mmhg",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "resting_hr",
    storageKey: "resting_hr",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  { id: "goal", storageKey: "goal", type: "select", defaultValue: "1" },
  {
    id: "activity",
    storageKey: "activity",
    type: "select",
    defaultValue: "1.1",
  },
  {
    id: "workout_calories",
    storageKey: "workout_calories",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "workouts_per_week",
    storageKey: "workouts_per_week",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "measured_rmr",
    storageKey: "measured_rmr",
    type: "input",
    defaultValue: "",
    numeric: true,
  },

  // Strength assessment fields
  {
    id: "grip_strength_left",
    storageKey: "grip_strength_left",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "grip_strength_right",
    storageKey: "grip_strength_right",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "grip_strength_avg",
    storageKey: "grip_strength_avg",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "bench_10rm",
    storageKey: "bench_10rm",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "chop_10rm",
    storageKey: "chop_10rm",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "pulldown_10rm",
    storageKey: "pulldown_10rm",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "dl_10rm",
    storageKey: "dl_10rm",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "upper_strength_score",
    storageKey: "upper_strength_score",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "lower_strength_score",
    storageKey: "lower_strength_score",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "core_strength_score",
    storageKey: "core_strength_score",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "total_strength_score",
    storageKey: "total_strength_score",
    type: "input",
    defaultValue: "",
    numeric: true,
  },

  // Cardio assessment fields
  {
    id: "six_min_distance",
    storageKey: "six_min_distance",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "cooper_vo2max",
    storageKey: "cooper_vo2max",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "watts_peak_workload",
    storageKey: "watts_peak_workload",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "hr_bpm",
    storageKey: "hr_bpm",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "post_heart_rate",
    storageKey: "post_heart_rate",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "storer_vo2max",
    storageKey: "storer_vo2max",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },

  // Nutrition parameters
  { id: "protein", storageKey: "protein", type: "select", defaultValue: "1.2" },
  { id: "fat", storageKey: "fat", type: "select", defaultValue: "0.3" },
  {
    id: "fat_calories_percent",
    storageKey: "fat_calories_percent",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "carb_calories_percent",
    storageKey: "carb_calories_percent",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "weight_loss_conservative",
    storageKey: "weight_loss_conservative",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "weight_loss_aggressive",
    storageKey: "weight_loss_aggressive",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "weight_gain_conservative",
    storageKey: "weight_gain_conservative",
    type: "input",
    defaultValue: "",
    numeric: true,
  },
  {
    id: "weight_gain_aggressive",
    storageKey: "weight_gain_aggressive",
    type: "input",
    defaultValue: "",
    numeric: true,
  },

  // Calculated body composition values
  {
    id: "fat_mass",
    storageKey: "fat_mass",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "fat_free_mass",
    storageKey: "fat_free_mass",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "fat_mass_index",
    storageKey: "fat_mass_index",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "fat_free_mass_index",
    storageKey: "fat_free_mass_index",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "bmi",
    storageKey: "bmi",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "rmr",
    storageKey: "rmr",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },
  {
    id: "predicted_daily_calorie_burn",
    storageKey: "predicted_daily_calorie_burn",
    type: "input",
    defaultValue: "",
    numeric: true,
    calculated: true,
  },

  // Table cell values (read as textContent, not value)
  {
    id: "target_energy",
    storageKey: "target_energy",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "protein_value",
    storageKey: "protein_value",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "protein_grams",
    storageKey: "protein_grams",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "protein_calories",
    storageKey: "protein_calories",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fat_percentage",
    storageKey: "fat_percentage",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fat_grams",
    storageKey: "fat_grams",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fat_calories",
    storageKey: "fat_calories",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "carb_percentage",
    storageKey: "carb_percentage",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "carb_grams",
    storageKey: "carb_grams",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "carb_calories",
    storageKey: "carb_calories",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fiber_value",
    storageKey: "fiber_value",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fiber_grams",
    storageKey: "fiber_grams",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fluid_ml_per_kg",
    storageKey: "fluid_ml_per_kg",
    type: "table",
    defaultValue: "",
    calculated: true,
  },
  {
    id: "fluid_total",
    storageKey: "fluid_total",
    type: "table",
    defaultValue: "",
    calculated: true,
  },

  // Special values that aren't directly tied to visible DOM elements
  {
    id: null,
    storageKey: "selected_vo2_method",
    type: "special",
    defaultValue: null,
  },
  {
    id: null,
    storageKey: "unified_vo2max",
    type: "special",
    defaultValue: null,
  },
];

async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`,
  });
  const savedDb = localStorage.getItem("nutritionDb");
  if (savedDb) {
    try {
      const uInt8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uInt8Array);
    } catch (e) {
      console.error(
        "Failed to load database from localStorage, creating new one.",
        e
      );
      localStorage.removeItem("nutritionDb"); // Remove corrupted data
      db = new SQL.Database();
      db.run(
        `CREATE TABLE IF NOT EXISTS nutrition (key TEXT PRIMARY KEY, value TEXT)`
      );
    }
  } else {
    db = new SQL.Database();
    db.run(
      `CREATE TABLE IF NOT EXISTS nutrition (key TEXT PRIMARY KEY, value TEXT)`
    );
  }
}

function saveToDatabase(key, value) {
  if (db && typeof value !== "undefined" && value !== null) {
    // Ensure db is initialized and value is valid
    try {
      db.run(`INSERT OR REPLACE INTO nutrition (key, value) VALUES (?, ?)`, [
        key,
        String(value),
      ]);
      const data = db.export();
      localStorage.setItem("nutritionDb", JSON.stringify(Array.from(data)));
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
 * Updates the state and appearance of a calculated field
 * @param {string} elementId - ID of the element to update
 * @param {string|null} value - Value to set, or null to clear
 */
function updateCalculatedField(elementId, value) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (value === null || value === "") {
    if (element.tagName === "INPUT") {
      element.value = "";
    } else {
      element.textContent = "";
    }
    element.classList.remove("calc-available");
    element.classList.add("calc-unavailable");
  } else {
    if (element.tagName === "INPUT") {
      element.value = value;
    } else {
      element.textContent = value;
    }
    element.classList.remove("calc-unavailable");
    element.classList.add("calc-available");
  }
}

/**
 * Updates a table cell with a formatted value
 * @param {string} id - Element ID
 * @param {string|number} value - Value to display
 * @param {string} [suffix=''] - Optional unit suffix
 */
function updateTableValue(id, value, suffix = "") {
  const formattedValue = value + suffix;
  updateCalculatedField(id, formattedValue);
  // Also save to storage
  saveToDatabase(id, formattedValue);
}

/**
 * Gets a parsed numeric value from an element
 * @param {string} elementId - ID of the element to read from
 * @returns {number|null} - Parsed numeric value or null if invalid
 */
function getNumericValue(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const value = parseFloat(element.value);
  return !isNaN(value) ? value : null;
}

/**
 * Updates the appearance of user input fields.
 * Numeric inputs that are empty or invalid receive the .input-empty class.
 */
function updateInputStyles() {
  fields.forEach((field) => {
    if (!field.id || !field.numeric) return; // Only process numeric fields with DOM elements

    const element = document.getElementById(field.id);
    if (!element) return;

    if (
      element.value === null ||
      element.value.trim() === "" ||
      isNaN(parseFloat(element.value))
    ) {
      element.classList.add("input-empty");
    } else {
      element.classList.remove("input-empty");
    }
  });
}

/**
 * Calculates body composition values.
 */
function calculateBodyComposition() {
  const weight = getNumericValue("weight");
  const bodyFat = getNumericValue("bodyfat");
  const height = getNumericValue("height");
  const age = getNumericValue("age");
  const gender = document.getElementById("gender").value;

  // Check if ALL required inputs are valid numbers
  if (weight === null || bodyFat === null || height === null || age === null) {
    // Clear computed fields
    [
      "fat_mass",
      "fat_free_mass",
      "fat_mass_index",
      "fat_free_mass_index",
      "bmi",
      "rmr",
    ].forEach((id) => updateCalculatedField(id, null));
    return;
  }

  // Fat mass and fat-free mass calculations
  const fatMass = (bodyFat / 100) * weight;
  const fatFreeMass = weight - fatMass;
  updateCalculatedField("fat_mass", fatMass.toFixed(2));
  updateCalculatedField("fat_free_mass", fatFreeMass.toFixed(2));

  // Unit conversions
  const weightkg = weight / 2.20462;
  const heightcm = height * 2.54;
  const heightm = heightcm / 100;

  // Calculate indexes
  const fatMassIndex = (weightkg * (bodyFat / 100)) / (heightm * heightm);
  const fatFreeMassIndex =
    (weightkg * (1 - bodyFat / 100)) / (heightm * heightm);
  const bmi = weightkg / (heightm * heightm);

  updateCalculatedField("fat_mass_index", fatMassIndex.toFixed(2));
  updateCalculatedField("fat_free_mass_index", fatFreeMassIndex.toFixed(2));
  updateCalculatedField("bmi", bmi.toFixed(2));

  // Calculate RMR
  const rmr =
    gender === "male"
      ? 10 * weightkg + 6.25 * heightcm - 5 * age + 5
      : 10 * weightkg + 6.25 * heightcm - 5 * age - 161;

  updateCalculatedField("rmr", rmr.toFixed(0));
}

/**
 * Calculates the average grip strength.
 */
function calculateAverageGripStrength() {
  const leftGrip = parseFloat(
    document.getElementById("grip_strength_left").value
  );
  const rightGrip = parseFloat(
    document.getElementById("grip_strength_right").value
  );
  const avgElem = document.getElementById("grip_strength_avg");

  if (!isNaN(leftGrip) && !isNaN(rightGrip)) {
    const avgGrip = (leftGrip + rightGrip) / 2;
    avgElem.value = avgGrip.toFixed(2);
    avgElem.classList.remove("calc-unavailable");
    avgElem.classList.add("calc-available");
  } else {
    avgElem.value = "";
    avgElem.classList.remove("calc-available");
    avgElem.classList.add("calc-unavailable");
  }
}

/**
 * Performs calculations that depend on workout, activity, and nutrient data.
 */
function calculateOtherValues() {
  const workoutCalories = parseFloat(
    document.getElementById("workout_calories").value
  );
  const workoutsPerWeek = parseFloat(
    document.getElementById("workouts_per_week").value
  );
  const activity = parseFloat(document.getElementById("activity").value);
  const goalMultiplier = parseFloat(document.getElementById("goal").value);
  const rmrVal = parseFloat(document.getElementById("rmr").value); // Get calculated RMR
  const weight = parseFloat(document.getElementById("weight").value); // Needed for fluid/protein

  const predElem = document.getElementById("predicted_daily_calorie_burn");
  const tableFieldsToClear = [
    "target_energy",
    "protein_value",
    "protein_grams",
    "protein_calories",
    "fat_percentage",
    "fat_grams",
    "fat_calories",
    "fiber_value",
    "fiber_grams",
    "carb_percentage",
    "carb_grams",
    "carb_calories",
    "fluid_ml_per_kg",
    "fluid_total",
  ];

  // Check if ALL needed inputs for this section are valid
  const inputsValid =
    !isNaN(workoutCalories) &&
    !isNaN(workoutsPerWeek) &&
    !isNaN(activity) &&
    !isNaN(goalMultiplier) &&
    !isNaN(rmrVal) &&
    !isNaN(weight);

  if (inputsValid) {
    const weeklyWorkoutCalories = workoutCalories * workoutsPerWeek;
    const averageDailyWorkoutCalories = weeklyWorkoutCalories / 7;
    const predictedDailyCalorieBurn =
      rmrVal * activity + averageDailyWorkoutCalories;
    const targetEnergy = predictedDailyCalorieBurn * goalMultiplier;

    predElem.value = predictedDailyCalorieBurn.toFixed(0);
    predElem.classList.remove("calc-unavailable");
    predElem.classList.add("calc-available");

    // Update table cells in the results table
    const updateTableField = (id, content) => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.textContent = content;
        elem.classList.remove("calc-unavailable");
        elem.classList.add("calc-available");
      }
    };

    updateTableField("target_energy", targetEnergy.toFixed(0));

    // Protein calculations
    const proteinFactor = parseFloat(document.getElementById("protein").value);
    const weightkg = weight / 2.20462;
    updateTableField(
      "protein_value",
      proteinFactor.toFixed(2) + " g/kg Body Weight"
    ); // Corrected unit label
    const proteinGrams = weightkg * proteinFactor;
    updateTableField("protein_grams", proteinGrams.toFixed(0) + " g");
    const proteinCalories = proteinGrams * 4;
    updateTableField("protein_calories", proteinCalories.toFixed(0) + " kcal");

    // Fat calculations
    const fatPercentage = parseFloat(document.getElementById("fat").value);
    updateTableField("fat_percentage", (fatPercentage * 100).toFixed(0) + "%");
    const fatGrams = (targetEnergy * fatPercentage) / 9;
    updateTableField("fat_grams", fatGrams.toFixed(0) + " g");
    const fatCalories = fatGrams * 9;
    updateTableField("fat_calories", fatCalories.toFixed(0) + " kcal");

    // Fiber calculations
    const fiberGrams = (targetEnergy / 1000) * 14;
    updateTableField("fiber_value", "14 g/1000kcal");
    updateTableField("fiber_grams", fiberGrams.toFixed(0) + " g");

    // Carbs calculations
    const remainingCarbCalories =
      targetEnergy - (proteinCalories + fatCalories);
    const carbGrams = remainingCarbCalories > 0 ? remainingCarbCalories / 4 : 0;
    const carbPercentage =
      targetEnergy > 0 ? (remainingCarbCalories / targetEnergy) * 100 : 0;
    updateTableField("carb_percentage", carbPercentage.toFixed(2) + "%");
    updateTableField("carb_grams", carbGrams.toFixed(0) + " g");
    updateTableField(
      "carb_calories",
      remainingCarbCalories.toFixed(0) + " kcal"
    );

    // Fluid calculations
    const fluidIntake = weightkg * 40;
    updateTableField("fluid_ml_per_kg", "40 ml/kg/day");
    updateTableField("fluid_total", fluidIntake.toFixed(0) + " ml");
  } else {
    // Clear and mark calculated fields as unavailable
    if (predElem) {
      predElem.value = "";
      predElem.classList.remove("calc-available");
      predElem.classList.add("calc-unavailable");
    }
    tableFieldsToClear.forEach((id) => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.textContent = "";
        elem.classList.remove("calc-available");
        elem.classList.add("calc-unavailable");
      }
    });
  }

  // Calculate Cooper VO2 Max
  const sixMinDistance = parseFloat(
    document.getElementById("six_min_distance").value
  );
  const cooperElem = document.getElementById("cooper_vo2max");

  // Calculate Bike/Storer VO2 Max
  const watts = parseFloat(
    document.getElementById("watts_peak_workload").value
  );
  const age = parseFloat(document.getElementById("age").value);
  // weight already parsed above
  const gender = document.getElementById("gender").value;
  const storerElem = document.getElementById("storer_vo2max");

  // Get potential values for both methods
  let cooperVO2Max = null;
  let storerVO2Max = null;

  // Calculate Cooper if inputs are valid
  if (!isNaN(sixMinDistance) && sixMinDistance > 0) {
    cooperVO2Max = 35.97 * (sixMinDistance * 2) - 11.29;
  }

  // Calculate Storer if inputs are valid
  if (
    !isNaN(watts) &&
    !isNaN(age) &&
    !isNaN(weight) &&
    watts > 0 &&
    weight > 0
  ) {
    const weightkg = weight / 2.20462;
    if (gender === "male") {
      storerVO2Max =
        (10.51 * watts + 6.35 * weightkg - 10.49 * age + 519.3) / weightkg;
    } else {
      // female
      storerVO2Max =
        (9.39 * watts + 7.7 * weightkg - 5.88 * age + 136.7) / weightkg;
    }
  }

  // Logic for which method to display and store
  let selectedVO2Method = localStorage.getItem("selected_vo2_method") || null;
  let currentVO2Value = null;

  // If no method is selected yet or user has both sets of inputs, default to Storer if available
  if (!selectedVO2Method) {
    if (storerVO2Max !== null) {
      selectedVO2Method = "storer";
    } else if (cooperVO2Max !== null) {
      selectedVO2Method = "cooper";
    }
  }

  // Clear both fields first
  cooperElem.value = "";
  cooperElem.classList.remove("calc-available");
  cooperElem.classList.add("calc-unavailable");

  storerElem.value = "";
  storerElem.classList.remove("calc-available");
  storerElem.classList.add("calc-unavailable");

  // Set the selected method's value
  if (selectedVO2Method === "storer" && storerVO2Max !== null) {
    storerElem.value = storerVO2Max.toFixed(2);
    storerElem.classList.remove("calc-unavailable");
    storerElem.classList.add("calc-available");
    currentVO2Value = storerVO2Max.toFixed(2);
  } else if (selectedVO2Method === "cooper" && cooperVO2Max !== null) {
    cooperElem.value = cooperVO2Max.toFixed(2);
    cooperElem.classList.remove("calc-unavailable");
    cooperElem.classList.add("calc-available");
    currentVO2Value = cooperVO2Max.toFixed(2);
  }

  // Store the selected method and the unified VO2 max value
  if (selectedVO2Method) {
    saveToDatabase("selected_vo2_method", selectedVO2Method);
    saveToDatabase("unified_vo2max", currentVO2Value);
  }

  // Save calculated TABLE values to storage (redundant with field saves but ensures table reflects stored state)
  function saveTableValueToStorage(id) {
    const elem = document.getElementById(id);
    if (elem && elem.textContent) {
      saveToDatabase(id, elem.textContent); // Use saveToDatabase which handles both
    }
  }
  const tableValueIds = [
    "target_energy",
    "protein_value",
    "protein_grams",
    "protein_calories",
    "fat_percentage",
    "fat_grams",
    "fat_calories",
    "carb_percentage",
    "carb_grams",
    "carb_calories",
    "fiber_value",
    "fiber_grams",
    "fluid_ml_per_kg",
    "fluid_total",
  ];
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

  // Save all field values to storage consistently
  saveAllFields();

  // Also save any specific fields needed for the report that might not be covered by saveAllFields
  // For example, ensure VO2Max data is accessible
  const selectedMethod = localStorage.getItem("selected_vo2_method");
  if (selectedMethod === "cooper") {
    const cooperVO2 = document.getElementById("cooper_vo2max").value;
    if (cooperVO2) {
      saveToDatabase("unified_vo2max", cooperVO2);
    }
  } else if (selectedMethod === "storer") {
    const storerVO2 = document.getElementById("storer_vo2max").value;
    if (storerVO2) {
      saveToDatabase("unified_vo2max", storerVO2);
    }
  }

  // Ensure strength/assessment data needed by report is saved
  const strengthScoreFields = [
    "upper_strength_score",
    "lower_strength_score",
    "core_strength_score",
    "total_strength_score",
  ];
  strengthScoreFields.forEach((field) => {
    const element = document.getElementById(field);
    if (element && element.value) {
      saveToDatabase(field, element.value);
    }
  });

  // For the grip strength data that report.js relies on:
  const gripFields = [
    "grip_strength_left",
    "grip_strength_right",
    "grip_strength_avg",
  ];
  gripFields.forEach((field) => {
    const element = document.getElementById(field);
    if (element && element.value) {
      saveToDatabase(field, element.value);
    }
  });
}

/**
 * Saves all field values to storage
 */
function saveAllFields() {
  console.log("Saving all fields to storage");

  fields.forEach((field) => {
    if (!field.id && field.type !== "special") return; // Skip non-special fields with no DOM element

    let value;

    if (field.type === "special") {
      // Handle special fields that might be stored elsewhere or calculated separately
      value = localStorage.getItem(field.storageKey);
    } else {
      const element = document.getElementById(field.id);
      if (!element) {
        console.warn(`Element not found for field: ${field.id}`);
        return;
      }

      // Get value based on element type
      if (field.type === "table") {
        value = element.textContent;
      } else {
        // For input and select elements
        value = element.value;
      }
    }

    // Only save if we have a value
    if (typeof value !== "undefined" && value !== null) {
      // For numeric fields with special formatting requirements
      if (field.numeric && value !== "" && !isNaN(parseFloat(value))) {
        const numericValue = parseFloat(value);

        // Format specific fields with units for report.js compatibility
        if (field.id === "rmr" || field.storageKey === "rmr") {
          value = `${numericValue} kcal/day`;
        } else if (
          field.id === "measured_rmr" ||
          field.storageKey === "measured_rmr"
        ) {
          value = `${numericValue} kcal/day`;
        } else if (
          field.id === "cooper_vo2max" ||
          field.id === "storer_vo2max" ||
          field.storageKey === "unified_vo2max"
        ) {
          value = `${numericValue}`;
        } else if (field.id && field.id.includes("strength_score")) {
          value = `${numericValue}`;
        } else {
          // For other numeric fields, just use the numeric value
          value = numericValue;
        }
      }

      // Log any important fields to help with debugging
      if (
        field.id === "measured_rmr" ||
        field.id === "weight" ||
        field.id === "height"
      ) {
        console.log(`Saving ${field.id} with value: ${value}`);
      }

      // Save to both database and localStorage for redundancy
      saveToDatabase(field.storageKey, value);
      localStorage.setItem(field.storageKey, String(value));
    }
  });

  console.log("All fields saved");
}

/**
 * Verifies that key data needed for the report exists in localStorage
 * Logs warnings for missing data
 */
function verifyReportData() {
  const requiredKeys = [
    "first_name",
    "last_name",
    "exam_date",
    "bmi",
    "fat_mass_index",
    "fat_free_mass_index",
    "grip_strength_avg",
    "resting_hr",
    "sbp_mmhg",
    "dbp_mmhg",
    "rmr",
    "measured_rmr",
    "unified_vo2max",
    "total_strength_score",
  ];

  const missingKeys = requiredKeys.filter((key) => !localStorage.getItem(key));

  if (missingKeys.length > 0) {
    console.warn("Some data required for the report is missing:", missingKeys);
    return false;
  }

  return true;
}

// Update the viewReport function to check data first
function viewReport() {
  // First save all data
  calculateValues();

  // Verify data exists
  const dataComplete = verifyReportData();
  if (!dataComplete) {
    if (
      confirm(
        "Some data required for the report may be missing. View report anyway?"
      )
    ) {
      window.location.href = "reportgpttest.html";
    }
  } else {
    window.location.href = "reportgpttest.html";
  }
}

/**
 * Manually triggers calculation and saving, providing user feedback.
 */
function manualSave() {
  try {
    calculateValues();

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    showFeedback(
      "save-feedback",
      `✓ Metrics calculated and data saved successfully at ${timeString}`,
      "success"
    );

    // Highlight the button briefly
    const saveButton = document.querySelector(".btn-success");
    if (saveButton) {
      saveButton.style.transition = "background-color 0.3s ease";
      const originalBg = saveButton.style.backgroundColor;
      saveButton.style.backgroundColor = "#28a745";
      setTimeout(() => {
        saveButton.style.backgroundColor = originalBg;
      }, 300);
    }
  } catch (error) {
    console.error("Error during manual save:", error);
    showFeedback(
      "save-feedback",
      "✗ Error calculating metrics or saving data. Check console for details.",
      "error",
      7000
    );
  }
}

/**
 * Creates or updates a feedback message element
 * @param {string} id - ID for the feedback element
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success', 'error', or 'info')
 * @param {number} duration - How long to display the message (in ms)
 */
function showFeedback(id, message, type = "success", duration = 5000) {
  // Remove any existing feedback
  const existingFeedback =
    document.getElementById("save-feedback") ||
    document.getElementById("clear-feedback");
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create feedback element
  const feedback = document.createElement("div");
  feedback.id = id;
  feedback.style.marginTop = "10px";
  feedback.style.padding = "8px 15px";
  feedback.style.borderRadius = "4px";
  feedback.style.textAlign = "center";
  feedback.style.fontWeight = "bold";
  feedback.style.transition = "opacity 0.5s ease-in-out";
  feedback.style.opacity = "1";
  feedback.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
  feedback.textContent = message;

  // Set styles based on type
  switch (type) {
    case "success":
      feedback.style.backgroundColor = "#d4edda";
      feedback.style.color = "#155724";
      feedback.style.border = "1px solid #c3e6cb";
      break;
    case "error":
      feedback.style.backgroundColor = "#f8d7da";
      feedback.style.color = "#721c24";
      feedback.style.border = "1px solid #f5c6cb";
      break;
    case "info":
      feedback.style.backgroundColor = "#d1ecf1";
      feedback.style.color = "#0c5460";
      feedback.style.border = "1px solid #bee5eb";
      break;
  }

  // Append to container
  const buttonContainer = document.querySelector(".text-center.mt-3");
  if (buttonContainer) {
    buttonContainer.appendChild(feedback);
  } else {
    document.querySelector("form").appendChild(feedback);
  }

  // Auto-hide after duration
  setTimeout(() => {
    feedback.style.opacity = "0";
    setTimeout(() => feedback.remove(), 500);
  }, duration);

  return feedback;
}

// Consolidated DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async function () {
  try {
    console.log("DOM Content Loaded - initializing application");

    // Initialize database first
    await initDatabase();
    console.log("Database initialized");

    // Load saved data
    await loadAllFields();
    console.log("Fields loaded from storage");

    // Add event listeners to input fields for calculation
    fields.forEach((field) => {
      if (field.id) {
        const element = document.getElementById(field.id);
        if (element) {
          // For all fields, add change listener
          element.addEventListener("change", function () {
            console.log(`Field changed: ${field.id}`);
            calculateValues();
          });

          // For numeric fields, add debounced input listener
          if (field.numeric) {
            element.addEventListener(
              "input",
              debounce(function () {
                calculateValues();
              }, 500)
            );
          }
        }
      }
    });

    // Special handling for measured_rmr field persistence
    const measuredRmrField = document.getElementById("measured_rmr");
    if (measuredRmrField) {
      console.log("Setting up measured_rmr special handling");

      measuredRmrField.addEventListener("change", function () {
        const value = this.value;
        if (value !== "") {
          console.log(`Saving measured_rmr: ${value}`);
          saveToDatabase("measured_rmr", value);
          localStorage.setItem("measured_rmr", value);
        }
      });
    }

    // Special handling for Cooper/Storer method selection
    document
      .getElementById("six_min_distance")
      .addEventListener("input", function () {
        if (this.value.trim() !== "") {
          document.getElementById("watts_peak_workload").value = "";
          localStorage.setItem("selected_vo2_method", "cooper");
        }
      });

    document
      .getElementById("watts_peak_workload")
      .addEventListener("input", function () {
        if (this.value.trim() !== "") {
          document.getElementById("six_min_distance").value = "";
          localStorage.setItem("selected_vo2_method", "storer");
        }
      });

    // Set up the Save/Calculate button handlers
    const saveButton = document.querySelector(".btn-success");
    if (saveButton) {
      saveButton.addEventListener("click", manualSave);
    }

    // Set up the Clear button handlers
    const clearButton = document.querySelector(".btn-danger");
    if (clearButton) {
      clearButton.addEventListener("click", clearAllData);
    }

    // Set up the View Report button handlers
    const reportButton = document.querySelector(".btn-primary");
    if (reportButton) {
      reportButton.addEventListener("click", viewReport);
    }

    // Save data before unloading the page
    window.addEventListener("beforeunload", function () {
      console.log("Saving data before page unload");
      saveAllFields();
    });

    // Initial calculation to update any derived fields
    calculateValues();

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error during application initialization:", error);
  }
});

// Debounce function to prevent excessive calculations during typing
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Loads all field values from storage
 */
async function loadAllFields() {
  console.log("Loading all fields from storage");

  // Get today's date for defaults
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayFormatted = `${yyyy}-${mm}-${dd}`;

  // Process each field defined in the fields array
  for (const field of fields) {
    if (!field.id) continue; // Skip special fields with no DOM element

    const element = document.getElementById(field.id);
    if (!element) {
      console.warn(`Element not found for field: ${field.id}`);
      continue;
    }

    // First try loading from database, then fall back to localStorage
    let value = loadFromDatabase(field.storageKey);

    // If not in database, try directly from localStorage
    if (value === null) {
      value = localStorage.getItem(field.storageKey);
    }

    // Debug output to help diagnose issues
    console.log(`Loading field ${field.id}: stored value = "${value}"`);

    // Apply default if no value found
    if (value === null || value === undefined || value === "") {
      if (field.special === "date") {
        value = todayFormatted;
      } else {
        value = field.defaultValue;
      }
      console.log(`Using default value for ${field.id}: "${value}"`);
    }

    // For fields with units in the stored value (e.g., "1500 kcal/day"), extract the number
    if (field.numeric && typeof value === "string" && value.includes(" ")) {
      const numericPart = parseFloat(value);
      if (!isNaN(numericPart)) {
        value = numericPart;
        console.log(
          `Extracted numeric value ${value} from stored value for field ${field.id}`
        );
      }
    }

    // Set the value based on element type
    if (field.type === "table") {
      element.textContent = value;
      // Update styling for table cells
      if (value && value.trim() !== "") {
        element.classList.remove("calc-unavailable");
        element.classList.add("calc-available");
      } else {
        element.classList.remove("calc-available");
        element.classList.add("calc-unavailable");
      }
    } else {
      // For input and select elements
      element.value = value;

      // Update styling for numeric inputs
      if (field.numeric) {
        updateInputStyle(element);
      }

      // Update styling for calculated fields
      if (field.calculated) {
        if (value && value !== "") {
          element.classList.remove("calc-unavailable");
          element.classList.add("calc-available");
        } else {
          element.classList.remove("calc-available");
          element.classList.add("calc-unavailable");
        }
      }
    }
  }

  // Special handling for measured_rmr field to ensure it loads correctly
  const measuredRmrElement = document.getElementById("measured_rmr");
  if (measuredRmrElement) {
    let measuredRmrValue = loadFromDatabase("measured_rmr");

    // If not found in database, try direct localStorage as fallback
    if (measuredRmrValue === null) {
      measuredRmrValue = localStorage.getItem("measured_rmr");
    }

    // If we have a value, set it
    if (
      measuredRmrValue !== null &&
      measuredRmrValue !== undefined &&
      measuredRmrValue !== ""
    ) {
      console.log(`Setting measured_rmr from storage: ${measuredRmrValue}`);
      measuredRmrElement.value = measuredRmrValue;
      if (measuredRmrElement.value) {
        measuredRmrElement.classList.remove("input-empty");
      }
    }
  }

  console.log("All fields loaded");
}

// Helper function to update the style of an individual input
function updateInputStyle(element) {
  if (!element) return;

  if (
    element.value === null ||
    element.value.trim() === "" ||
    isNaN(parseFloat(element.value))
  ) {
    element.classList.add("input-empty");
  } else {
    element.classList.remove("input-empty");
  }
}

/**
 * Handles clearing all data.
 */
function clearAllData() {
  if (
    confirm("Are you sure you want to clear all data? This cannot be undone.")
  ) {
    // Remove all saved data from localStorage
    localStorage.clear();

    // Reset the in-memory database if initialized
    if (db) {
      try {
        db.run("DROP TABLE IF EXISTS nutrition");
        db.run(
          `CREATE TABLE IF NOT EXISTS nutrition (key TEXT PRIMARY KEY, value TEXT)`
        );
      } catch (e) {
        console.error("Failed to reset database:", e);
      }
    }

    // Reload fields so the form resets to default values
    loadAllFields();

    showFeedback("clear-feedback", "All data has been cleared.", "info", 3000);
  }
}

/**
 * Handles VO2 max calculation and method selection
 */
function updateVo2MaxValues() {
  const sixMinDistance = getNumericValue("six_min_distance");
  const watts = getNumericValue("watts_peak_workload");
  const age = getNumericValue("age");
  const weight = getNumericValue("weight");
  const gender = document.getElementById("gender").value;

  // Calculate both methods if possible
  let cooperVO2Max = null;
  let storerVO2Max = null;

  if (sixMinDistance !== null && sixMinDistance > 0) {
    cooperVO2Max = 35.97 * (sixMinDistance * 2) - 11.29;
  }

  if (
    watts !== null &&
    age !== null &&
    weight !== null &&
    watts > 0 &&
    weight > 0
  ) {
    const weightkg = weight / 2.20462;
    storerVO2Max =
      gender === "male"
        ? (10.51 * watts + 6.35 * weightkg - 10.49 * age + 519.3) / weightkg
        : (9.39 * watts + 7.7 * weightkg - 5.88 * age + 136.7) / weightkg;
  }

  // Determine which method to use
  let selectedVO2Method = localStorage.getItem("selected_vo2_method") || null;
  if (!selectedVO2Method) {
    if (storerVO2Max !== null) {
      selectedVO2Method = "storer";
    } else if (cooperVO2Max !== null) {
      selectedVO2Method = "cooper";
    }
  }

  // Reset both fields first
  updateCalculatedField("cooper_vo2max", null);
  updateCalculatedField("storer_vo2max", null);

  // Set the selected value and save
  let currentVO2Value = null;

  if (selectedVO2Method === "storer" && storerVO2Max !== null) {
    updateCalculatedField("storer_vo2max", storerVO2Max.toFixed(2));
    currentVO2Value = storerVO2Max.toFixed(2);
  } else if (selectedVO2Method === "cooper" && cooperVO2Max !== null) {
    updateCalculatedField("cooper_vo2max", cooperVO2Max.toFixed(2));
    currentVO2Value = cooperVO2Max.toFixed(2);
  }

  if (selectedVO2Method && currentVO2Value) {
    saveToDatabase("selected_vo2_method", selectedVO2Method);
    saveToDatabase("unified_vo2max", currentVO2Value);
  }
}

/**
 * Checks if all specified fields have valid numeric values
 * @param {string[]} fieldIds - Array of field IDs to check
 * @returns {boolean} - True if all fields have valid values
 */
function allFieldsValid(fieldIds) {
  return fieldIds.every((id) => {
    const value = getNumericValue(id);
    return value !== null;
  });
}

/**
 * Verifies that specific fields are being properly saved and loaded
 * This function is for debugging purposes
 */
function verifyFieldPersistence(fieldId, storageKey) {
  const element = document.getElementById(fieldId);
  if (!element) {
    console.error(`Cannot find element with ID: ${fieldId}`);
    return false;
  }

  // Check the current value
  console.log(`Current ${fieldId} value:`, element.value);

  // Check what's in localStorage
  const storedValue = localStorage.getItem(storageKey);
  console.log(`Stored ${storageKey} value:`, storedValue);

  // Check what's in the database
  if (db) {
    try {
      const stmt = db.prepare(`SELECT value FROM nutrition WHERE key = ?`);
      stmt.bind([storageKey]);
      if (stmt.step()) {
        console.log(`Database ${storageKey} value:`, stmt.getAsObject().value);
      } else {
        console.log(`No value found in database for ${storageKey}`);
      }
      stmt.free();
    } catch (e) {
      console.error(`Failed to check database for ${storageKey}:`, e);
    }
  }

  return true;
}

// Add this to document ready to specifically save measured_rmr on page load and unload
document.addEventListener("DOMContentLoaded", function () {
  // Special handling for measured_rmr field
  const measuredRmrField = document.getElementById("measured_rmr");
  if (measuredRmrField) {
    // Log initial state
    verifyFieldPersistence("measured_rmr", "measured_rmr");

    // Add explicit event listeners to ensure value is saved
    measuredRmrField.addEventListener("change", function () {
      const value = this.value;
      if (value !== "") {
        console.log(`Explicitly saving measured_rmr: ${value}`);
        saveToDatabase("measured_rmr", value);
        localStorage.setItem("measured_rmr", value);
      }
    });

    // Also update on input with debounce
    measuredRmrField.addEventListener(
      "input",
      debounce(function () {
        const value = this.value;
        if (value !== "") {
          console.log(`Debounce saving measured_rmr: ${value}`);
          saveToDatabase("measured_rmr", value);
          localStorage.setItem("measured_rmr", value);
        }
      }, 500)
    );
  }

  // Save all values explicitly before leaving the page
  window.addEventListener("beforeunload", function () {
    // Extra save for measured_rmr to ensure it's captured
    const measuredRmr = document.getElementById("measured_rmr");
    if (measuredRmr && measuredRmr.value) {
      saveToDatabase("measured_rmr", measuredRmr.value);
      localStorage.setItem("measured_rmr", measuredRmr.value);
    }

    // Also perform a general save of all fields
    saveAllFields();
  });
});
