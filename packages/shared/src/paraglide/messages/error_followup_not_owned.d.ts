/**
* | output |
* | --- |
* | "You can only modify your own notes." |
*
* @param {Error_Followup_Not_OwnedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_owned: ((inputs?: Error_Followup_Not_OwnedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Followup_Not_OwnedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Followup_Not_OwnedInputs = {};
