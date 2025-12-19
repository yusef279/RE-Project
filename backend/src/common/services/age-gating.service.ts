import { Injectable } from '@nestjs/common';
import { AgeGroup, getAgeGroup, getAgeRange } from '../enums/age-group.enum';

/**
 * Service for enforcing age-appropriate content
 * Implements age-gating logic to ensure children only access content suitable for their age
 */
@Injectable()
export class AgeGatingService {
  /**
   * Check if content is appropriate for a child's age
   * @param childAge - The child's age
   * @param contentMinAge - Minimum age required for the content
   * @param contentMaxAge - Maximum age allowed for the content
   * @returns true if content is appropriate, false otherwise
   */
  isContentAppropriate(
    childAge: number,
    contentMinAge: number,
    contentMaxAge: number,
  ): boolean {
    if (childAge < 3 || childAge > 12) {
      return false;
    }

    return childAge >= contentMinAge && childAge <= contentMaxAge;
  }

  /**
   * Check if content is appropriate for a child's age group
   * @param childAge - The child's age
   * @param allowedAgeGroups - Array of allowed age groups
   * @returns true if content is appropriate, false otherwise
   */
  isContentAppropriateForAgeGroup(
    childAge: number,
    allowedAgeGroups: AgeGroup[],
  ): boolean {
    if (childAge < 3 || childAge > 12) {
      return false;
    }

    const childAgeGroup = getAgeGroup(childAge);
    return allowedAgeGroups.includes(childAgeGroup);
  }

  /**
   * Filter content based on child's age
   * @param childAge - The child's age
   * @param items - Array of items with minAge and maxAge properties
   * @returns Filtered array of appropriate items
   */
  filterByAge<T extends { minAge: number; maxAge: number }>(
    childAge: number,
    items: T[],
  ): T[] {
    return items.filter((item) =>
      this.isContentAppropriate(childAge, item.minAge, item.maxAge),
    );
  }

  /**
   * Get age group for a child
   * @param age - The child's age
   * @returns AgeGroup enum value
   */
  getChildAgeGroup(age: number): AgeGroup {
    return getAgeGroup(age);
  }

  /**
   * Get age range for a child's age group
   * @param age - The child's age
   * @returns Object with min and max age
   */
  getChildAgeRange(age: number): { min: number; max: number } {
    const ageGroup = getAgeGroup(age);
    return getAgeRange(ageGroup);
  }

  /**
   * Validate that a child's age is within allowed range
   * @param age - The child's age
   * @returns true if valid, throws error if invalid
   */
  validateAge(age: number): boolean {
    if (age < 3 || age > 12) {
      throw new Error(
        `Invalid age: ${age}. Age must be between 3 and 12 years.`,
      );
    }
    return true;
  }
}
