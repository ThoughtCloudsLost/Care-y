/**
* | output |
* | --- |
* | "What you wrote has been encrypted. Only assigned volunteers can read it. Even if someone breaks into this server, they cannot read it." |
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
