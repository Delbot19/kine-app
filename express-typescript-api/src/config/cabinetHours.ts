// Schedule Configuration
// Days are 0 (Sunday) to 6 (Saturday)
export const CABINET_SCHEDULE: Record<number, { open: boolean; start: number; end: number }> = {
    0: { open: false, start: 0, end: 0 }, // Dimanche: Fermé
    1: { open: true, start: 8, end: 18 }, // Lundi: 08:00 - 18:00
    2: { open: true, start: 8, end: 18 }, // Mardi: 08:00 - 18:00
    3: { open: true, start: 8, end: 18 }, // Mercredi: 08:00 - 18:00
    4: { open: true, start: 8, end: 18 }, // Jeudi: 08:00 - 18:00
    5: { open: true, start: 8, end: 18 }, // Vendredi: 08:00 - 18:00
    6: { open: true, start: 9, end: 13 }, // Samedi: 09:00 - 13:00
}

// Legacy exports for backward compatibility (if needed temporarily, though we should refactor usages)
// We will deprecate these over time or keep them as "default" ranges if helpful.
export const CABINET_OPENING_HOUR = 8
export const CABINET_CLOSING_HOUR = 18
export const CABINET_OPEN_DAYS = [1, 2, 3, 4, 5, 6]
