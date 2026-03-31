/**
* | output |
* | --- |
* | "This merge has already been undone." |
*
* @param {Error_Merge_Already_UndoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_already_undone: ((inputs?: Error_Merge_Already_UndoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Merge_Already_UndoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Merge_Already_UndoneInputs = {};
