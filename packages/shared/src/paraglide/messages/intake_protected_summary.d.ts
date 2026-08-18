/**
* | output |
* | --- |
* | "What you write here is encrypted before it leaves your device. Only assigned volunteers can read it. Even if someone breaks into this server, they cannot rea..." |
*
* @param {Intake_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_summary: ((inputs?: Intake_Protected_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_SummaryInputs = {};
