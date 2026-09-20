/**
* | output |
* | --- |
* | "Encrypted before it is sent. Readable only within the organization, and only by your case volunteers once someone takes your case." |
*
* @param {Intake_Submit_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_submit_hint: ((inputs?: Intake_Submit_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Submit_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Submit_HintInputs = {};
