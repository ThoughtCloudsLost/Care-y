/**
* | output |
* | --- |
* | "We're here to help. What you write is encrypted on your device before it is sent." |
*
* @param {Intake_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_intro: ((inputs?: Intake_IntroInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_IntroInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_IntroInputs = {};
