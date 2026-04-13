/**
* | output |
* | --- |
* | "Save filter shortcut" |
*
* @param {Tickets_Create_ShortcutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_create_shortcut: ((inputs?: Tickets_Create_ShortcutInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Create_ShortcutInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Create_ShortcutInputs = {};
