const hazardRatios = {
    "Low": 1.0,
    "Below Average": 1.0 / 1.95,
    "Above Average": 1.0 / (1.95 * 1.41),
    "High": 1.0 / (1.95 * 1.41 * 1.42),
    "Elite": 1.0 / 5.04
    };
    
    const vo2ReferenceTable = [
    // MALE
    {gender: 'MALE', ageLow: 18, ageHigh: 19, category: 'Low', min: 1, max: 10.7},
    {gender: 'MALE', ageLow: 18, ageHigh: 19, category: 'Below Average', min: 10.8, max: 12.9},
    {gender: 'MALE', ageLow: 18, ageHigh: 19, category: 'Above Average', min: 13.0, max: 13.9},
    {gender: 'MALE', ageLow: 18, ageHigh: 19, category: 'High', min: 14.0, max: 16.2},
    {gender: 'MALE', ageLow: 18, ageHigh: 19, category: 'Elite', min: 16.3, max: 100.0},
    
    {gender: 'MALE', ageLow: 20, ageHigh: 29, category: 'Low', min: 1, max: 10.2},
    {gender: 'MALE', ageLow: 20, ageHigh: 29, category: 'Below Average', min: 10.3, max: 11.9},
    {gender: 'MALE', ageLow: 20, ageHigh: 29, category: 'Above Average', min: 12.0, max: 13.6},
    {gender: 'MALE', ageLow: 20, ageHigh: 29, category: 'High', min: 13.7, max: 15.6},
    {gender: 'MALE', ageLow: 20, ageHigh: 29, category: 'Elite', min: 15.7, max: 100.0},
    
    {gender: 'MALE', ageLow: 30, ageHigh: 39, category: 'Low', min: 1, max: 9.9},
    {gender: 'MALE', ageLow: 30, ageHigh: 39, category: 'Below Average', min: 10.0, max: 11.1},
    {gender: 'MALE', ageLow: 30, ageHigh: 39, category: 'Above Average', min: 11.2, max: 12.9},
    {gender: 'MALE', ageLow: 30, ageHigh: 39, category: 'High', min: 13.0, max: 14.9},
    {gender: 'MALE', ageLow: 30, ageHigh: 39, category: 'Elite', min: 15.0, max: 100.0},
    
    {gender: 'MALE', ageLow: 40, ageHigh: 49, category: 'Low', min: 1, max: 9.7},
    {gender: 'MALE', ageLow: 40, ageHigh: 49, category: 'Below Average', min: 9.8, max: 10.9},
    {gender: 'MALE', ageLow: 40, ageHigh: 49, category: 'Above Average', min: 11.0, max: 12.4},
    {gender: 'MALE', ageLow: 40, ageHigh: 49, category: 'High', min: 12.5, max: 14.6},
    {gender: 'MALE', ageLow: 40, ageHigh: 49, category: 'Elite', min: 14.7, max: 100.0},
    
    {gender: 'MALE', ageLow: 50, ageHigh: 59, category: 'Low', min: 1, max: 8.1},
    {gender: 'MALE', ageLow: 50, ageHigh: 59, category: 'Below Average', min: 8.2, max: 9.9},
    {gender: 'MALE', ageLow: 50, ageHigh: 59, category: 'Above Average', min: 10.0, max: 11.3},
    {gender: 'MALE', ageLow: 50, ageHigh: 59, category: 'High', min: 11.4, max: 13.9},
    {gender: 'MALE', ageLow: 50, ageHigh: 59, category: 'Elite', min: 14.0, max: 100.0},
    
    {gender: 'MALE', ageLow: 60, ageHigh: 69, category: 'Low', min: 1, max: 6.9},
    {gender: 'MALE', ageLow: 60, ageHigh: 69, category: 'Below Average', min: 7.0, max: 8.4},
    {gender: 'MALE', ageLow: 60, ageHigh: 69, category: 'Above Average', min: 8.5, max: 9.9},
    {gender: 'MALE', ageLow: 60, ageHigh: 69, category: 'High', min: 10.0, max: 12.9},
    {gender: 'MALE', ageLow: 60, ageHigh: 69, category: 'Elite', min: 13.0, max: 100.0},
    
    {gender: 'MALE', ageLow: 70, ageHigh: 79, category: 'Low', min: 1, max: 5.9},
    {gender: 'MALE', ageLow: 70, ageHigh: 79, category: 'Below Average', min: 6.0, max: 6.9},
    {gender: 'MALE', ageLow: 70, ageHigh: 79, category: 'Above Average', min: 7.0, max: 8.4},
    {gender: 'MALE', ageLow: 70, ageHigh: 79, category: 'High', min: 8.5, max: 11.4},
    {gender: 'MALE', ageLow: 70, ageHigh: 79, category: 'Elite', min: 11.5, max: 100.0},
    
    {gender: 'MALE', ageLow: 80, ageHigh: 89, category: 'Low', min: 1, max: 5.0},
    {gender: 'MALE', ageLow: 80, ageHigh: 89, category: 'Below Average', min: 5.1, max: 6.2},
    {gender: 'MALE', ageLow: 80, ageHigh: 89, category: 'Above Average', min: 6.3, max: 7.2},
    {gender: 'MALE', ageLow: 80, ageHigh: 89, category: 'High', min: 7.3, max: 9.9},
    {gender: 'MALE', ageLow: 80, ageHigh: 89, category: 'Elite', min: 10.0, max: 100.0},
    
    // FEMALE
    {gender: 'FEMALE', ageLow: 18, ageHigh: 19, category: 'Low', min: 1, max: 9.9},
    {gender: 'FEMALE', ageLow: 18, ageHigh: 19, category: 'Below Average', min: 10.0, max: 11.0},
    {gender: 'FEMALE', ageLow: 18, ageHigh: 19, category: 'Above Average', min: 11.1, max: 12.9},
    {gender: 'FEMALE', ageLow: 18, ageHigh: 19, category: 'High', min: 13.0, max: 14.9},
    {gender: 'FEMALE', ageLow: 18, ageHigh: 19, category: 'Elite', min: 15.0, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 20, ageHigh: 29, category: 'Low', min: 1, max: 7.9},
    {gender: 'FEMALE', ageLow: 20, ageHigh: 29, category: 'Below Average', min: 8.0, max: 9.9},
    {gender: 'FEMALE', ageLow: 20, ageHigh: 29, category: 'Above Average', min: 10.0, max: 11.4},
    {gender: 'FEMALE', ageLow: 20, ageHigh: 29, category: 'High', min: 11.5, max: 14.2},
    {gender: 'FEMALE', ageLow: 20, ageHigh: 29, category: 'Elite', min: 14.3, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 30, ageHigh: 39, category: 'Low', min: 1, max: 7.6},
    {gender: 'FEMALE', ageLow: 30, ageHigh: 39, category: 'Below Average', min: 7.7, max: 9.3},
    {gender: 'FEMALE', ageLow: 30, ageHigh: 39, category: 'Above Average', min: 9.4, max: 10.8},
    {gender: 'FEMALE', ageLow: 30, ageHigh: 39, category: 'High', min: 10.9, max: 13.6},
    {gender: 'FEMALE', ageLow: 30, ageHigh: 39, category: 'Elite', min: 13.7, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 40, ageHigh: 49, category: 'Low', min: 1, max: 7.3},
    {gender: 'FEMALE', ageLow: 40, ageHigh: 49, category: 'Below Average', min: 7.4, max: 8.9},
    {gender: 'FEMALE', ageLow: 40, ageHigh: 49, category: 'Above Average', min: 9.0, max: 10.3},
    {gender: 'FEMALE', ageLow: 40, ageHigh: 49, category: 'High', min: 10.4, max: 13.2},
    {gender: 'FEMALE', ageLow: 40, ageHigh: 49, category: 'Elite', min: 13.3, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 50, ageHigh: 59, category: 'Low', min: 1, max: 6.9},
    {gender: 'FEMALE', ageLow: 50, ageHigh: 59, category: 'Below Average', min: 7.0, max: 8.0},
    {gender: 'FEMALE', ageLow: 50, ageHigh: 59, category: 'Above Average', min: 8.1, max: 9.9},
    {gender: 'FEMALE', ageLow: 50, ageHigh: 59, category: 'High', min: 10.0, max: 12.9},
    {gender: 'FEMALE', ageLow: 50, ageHigh: 59, category: 'Elite', min: 13.0, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 60, ageHigh: 69, category: 'Low', min: 1, max: 5.9},
    {gender: 'FEMALE', ageLow: 60, ageHigh: 69, category: 'Below Average', min: 6.0, max: 6.9},
    {gender: 'FEMALE', ageLow: 60, ageHigh: 69, category: 'Above Average', min: 7.0, max: 8.4},
    {gender: 'FEMALE', ageLow: 60, ageHigh: 69, category: 'High', min: 8.5, max: 11.0},
    {gender: 'FEMALE', ageLow: 60, ageHigh: 69, category: 'Elite', min: 11.1, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 70, ageHigh: 79, category: 'Low', min: 1, max: 4.9},
    {gender: 'FEMALE', ageLow: 70, ageHigh: 79, category: 'Below Average', min: 5.0, max: 5.9},
    {gender: 'FEMALE', ageLow: 70, ageHigh: 79, category: 'Above Average', min: 6.0, max: 6.9},
    {gender: 'FEMALE', ageLow: 70, ageHigh: 79, category: 'High', min: 7.0, max: 9.9},
    {gender: 'FEMALE', ageLow: 70, ageHigh: 79, category: 'Elite', min: 10.0, max: 100.0},
    
    {gender: 'FEMALE', ageLow: 80, ageHigh: 89, category: 'Low', min: 1, max: 4.3},
    {gender: 'FEMALE', ageLow: 80, ageHigh: 89, category: 'Below Average', min: 4.4, max: 5.4},
    {gender: 'FEMALE', ageLow: 80, ageHigh: 89, category: 'Above Average', min: 5.5, max: 6.2},
    {gender: 'FEMALE', ageLow: 80, ageHigh: 89, category: 'High', min: 6.3, max: 8.3},
    {gender: 'FEMALE', ageLow: 80, ageHigh: 89, category: 'Elite', min: 8.4, max: 100.0}
    ];