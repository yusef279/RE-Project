/**
 * Age group categories for children (3-12 years)
 * Used for age-appropriate content filtering
 */
export enum AgeGroup {
  PRESCHOOL = '3-5',    // Ages 3-5
  EARLY_ELEMENTARY = '6-8',  // Ages 6-8
  LATE_ELEMENTARY = '9-12', // Ages 9-12
}

/**
 * Get age group for a given age
 */
export function getAgeGroup(age: number): AgeGroup {
  if (age >= 3 && age <= 5) {
    return AgeGroup.PRESCHOOL;
  } else if (age >= 6 && age <= 8) {
    return AgeGroup.EARLY_ELEMENTARY;
  } else if (age >= 9 && age <= 12) {
    return AgeGroup.LATE_ELEMENTARY;
  }
  throw new Error(`Invalid age: ${age}. Age must be between 3 and 12.`);
}

/**
 * Check if an age falls within a specific age group
 */
export function isInAgeGroup(age: number, ageGroup: AgeGroup): boolean {
  return getAgeGroup(age) === ageGroup;
}

/**
 * Get minimum and maximum ages for an age group
 */
export function getAgeRange(ageGroup: AgeGroup): { min: number; max: number } {
  switch (ageGroup) {
    case AgeGroup.PRESCHOOL:
      return { min: 3, max: 5 };
    case AgeGroup.EARLY_ELEMENTARY:
      return { min: 6, max: 8 };
    case AgeGroup.LATE_ELEMENTARY:
      return { min: 9, max: 12 };
    default:
      throw new Error(`Unknown age group: ${ageGroup}`);
  }
}
