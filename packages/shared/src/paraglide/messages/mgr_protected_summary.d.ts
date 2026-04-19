/**
* | output |
* | --- |
* | "Your identity and client data are end-to-end encrypted. The server never holds plaintext." |
*
* @param {Mgr_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_protected_summary: ((inputs?: Mgr_Protected_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Protected_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Protected_SummaryInputs = {};
