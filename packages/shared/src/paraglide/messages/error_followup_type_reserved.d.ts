/**
* | output |
* | --- |
* | "That kind of entry is recorded from the Assistance card." |
*
* @param {Error_Followup_Type_ReservedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_type_reserved: ((inputs?: Error_Followup_Type_ReservedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Followup_Type_ReservedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Followup_Type_ReservedInputs = {};
