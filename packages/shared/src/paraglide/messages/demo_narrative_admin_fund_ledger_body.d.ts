/**
* | output |
* | --- |
* | "The fund ledger page lists every fund the organization has created, active and deactivated, with a balance card for each and the full entry history below. Vi..." |
*
* @param {Demo_Narrative_Admin_Fund_Ledger_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_fund_ledger_body: ((inputs?: Demo_Narrative_Admin_Fund_Ledger_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Fund_Ledger_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Fund_Ledger_BodyInputs = {};
