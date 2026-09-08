/**
 * A named, coloured bucket a timer can belong to.
 *
 * Timers reference a category by id and nothing resolves eagerly: an id that
 * does not match any stored category simply reads as uncategorised. That is
 * what lets a category be deleted without cascading through every timer, and
 * lets a backup be imported without its categories.
 */
export type Category = {
  id: string;
  name: string;
  /** Hex value taken from `PALETTE`. */
  color: string;
  /** Sort position in the chip row and the settings list, lowest first. */
  order: number;
};

/** The fields a user can edit through the category editor. */
export type CategoryDraft = Pick<Category, 'name' | 'color'>;
