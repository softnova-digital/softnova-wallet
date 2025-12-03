/**
 * Partner names for expense tracking
 * These represent who paid for each expense
 */
export const PARTNERS = ["Nihad Karulai", "Muhammed Rashad", "Softnova Digital"] as const;

export type Partner = typeof PARTNERS[number];

