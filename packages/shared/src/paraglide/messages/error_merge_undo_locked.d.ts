/**
* | output |
* | --- |
* | "This merge undo is locked." |
*
* @param {Error_Merge_Undo_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_undo_locked: ((inputs?: Error_Merge_Undo_LockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Merge_Undo_LockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Merge_Undo_LockedInputs = {};
