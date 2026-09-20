/**
* | output |
* | --- |
* | "Unsaved input on the simulator. Select again to continue." |
*
* @param {Demo_Dirty_Guard_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_dirty_guard_note: ((inputs?: Demo_Dirty_Guard_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Dirty_Guard_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Dirty_Guard_NoteInputs = {};
