/**
* | output |
* | --- |
* | "Encrypted before it is sent. Readable only within the organization, and only by your case volunteers once someone takes your case." |
*
* @param {Intake_Submit_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_submit_hint: ((inputs?: Intake_Submit_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Submit_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Submit_HintInputs = {};
