/**
* | output |
* | --- |
* | "The organization can open it until someone takes your case. After that, only your case volunteers can." |
*
* @param {Intake_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_summary: ((inputs?: Intake_Protected_SummaryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_SummaryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_SummaryInputs = {};
