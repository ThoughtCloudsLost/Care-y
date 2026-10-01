/**
* | output |
* | --- |
* | "A correction stays in the same fund." |
*
* @param {Assist_Edit_Fund_FixedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_edit_fund_fixed: ((inputs?: Assist_Edit_Fund_FixedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Assist_Edit_Fund_FixedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Assist_Edit_Fund_FixedInputs = {};
