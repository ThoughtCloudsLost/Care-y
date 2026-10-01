/**
* | output |
* | --- |
* | "Balances and every recorded entry" |
*
* @param {Hub_Fund_Ledger_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_fund_ledger_subtitle: ((inputs?: Hub_Fund_Ledger_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Fund_Ledger_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Fund_Ledger_SubtitleInputs = {};
