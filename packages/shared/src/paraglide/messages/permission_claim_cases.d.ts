/**
* | output |
* | --- |
* | "Claim cases" |
*
* @param {Permission_Claim_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_claim_cases: ((inputs?: Permission_Claim_CasesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Claim_CasesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Claim_CasesInputs = {};
