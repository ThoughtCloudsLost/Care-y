/**
* | output |
* | --- |
* | "That shared filter no longer exists." |
*
* @param {Error_Saved_Filter_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_saved_filter_not_found: ((inputs?: Error_Saved_Filter_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Saved_Filter_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Saved_Filter_Not_FoundInputs = {};
