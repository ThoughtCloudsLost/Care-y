/**
* | output |
* | --- |
* | "Claim cases" |
*
* @param {Permission_Claim_CasesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_claim_cases: ((inputs?: Permission_Claim_CasesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Claim_CasesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Claim_CasesInputs = {};
