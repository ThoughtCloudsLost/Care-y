/**
* | output |
* | --- |
* | "You cannot deactivate your own account." |
*
* @param {Error_Cannot_Deactivate_SelfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_deactivate_self: ((inputs?: Error_Cannot_Deactivate_SelfInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Deactivate_SelfInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Deactivate_SelfInputs = {};
