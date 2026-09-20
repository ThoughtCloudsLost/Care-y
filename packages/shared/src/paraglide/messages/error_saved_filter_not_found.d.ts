/**
* | output |
* | --- |
* | "That shared filter no longer exists." |
*
* @param {Error_Saved_Filter_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_saved_filter_not_found: ((inputs?: Error_Saved_Filter_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Saved_Filter_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Saved_Filter_Not_FoundInputs = {};
