/**
 * Kleiner Modul-State, um nach einem Möbel-Drag den "Geister-Klick" auf dem
 * darunterliegenden Boden zu unterdrücken (click folgt direkt auf pointerup).
 */
export const interaction = { suppressClick: false, dragging: false };

export function suppressNextClick() {
  interaction.suppressClick = true;
  setTimeout(() => {
    interaction.suppressClick = false;
  }, 0);
}
