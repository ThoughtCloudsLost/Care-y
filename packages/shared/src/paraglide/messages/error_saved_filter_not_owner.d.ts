/**
* | output |
* | --- |
* | "Only the person who shared a filter can change it." |
*
* @param {Error_Saved_Filter_Not_OwnerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_saved_filter_not_owner: ((inputs?: Error_Saved_Filter_Not_OwnerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Saved_Filter_Not_OwnerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Saved_Filter_Not_OwnerInputs = {};
