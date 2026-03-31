/**
* | output |
* | --- |
* | "Merge event not found." |
*
* @param {Error_Merge_Event_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_event_not_found: ((inputs?: Error_Merge_Event_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Merge_Event_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Merge_Event_Not_FoundInputs = {};
