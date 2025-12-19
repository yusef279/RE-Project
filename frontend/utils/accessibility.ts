/**
 * Accessibility utility functions
 * Provides helpers for keyboard navigation and ARIA attributes
 */

/**
 * Handle keyboard navigation for interactive elements
 * @param event - Keyboard event
 * @param onActivate - Callback to execute on Enter/Space
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  onActivate: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onActivate();
  }
}

/**
 * Get ARIA label for age group
 */
export function getAgeGroupAriaLabel(age: number): string {
  if (age >= 3 && age <= 5) {
    return 'Preschool age group, ages 3 to 5';
  } else if (age >= 6 && age <= 8) {
    return 'Early elementary age group, ages 6 to 8';
  } else if (age >= 9 && age <= 12) {
    return 'Late elementary age group, ages 9 to 12';
  }
  return 'Age group information';
}

/**
 * Get ARIA label for game card
 */
export function getGameCardAriaLabel(
  gameTitle: string,
  minAge: number,
  maxAge: number,
  category: string
): string {
  return `${gameTitle}, ${category} game for ages ${minAge} to ${maxAge}. Click to play.`;
}

/**
 * Get ARIA label for points display
 */
export function getPointsAriaLabel(points: number): string {
  return `Total points: ${points}`;
}

/**
 * Get ARIA label for badge
 */
export function getBadgeAriaLabel(badgeName: string, description?: string): string {
  return description
    ? `${badgeName} badge: ${description}`
    : `${badgeName} badge`;
}

/**
 * Focus management for modals and dialogs
 */
export function trapFocus(element: HTMLElement): void {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}
