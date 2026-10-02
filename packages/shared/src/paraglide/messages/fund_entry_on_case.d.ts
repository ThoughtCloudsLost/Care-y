/**
* | output |
* | --- |
* | "on a {ticket}" |
*
* @param {Fund_Entry_On_CaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_on_case: ((inputs: Fund_Entry_On_CaseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Entry_On_CaseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Entry_On_CaseInputs = {
    ticket: NonNullable<unknown>;
};
