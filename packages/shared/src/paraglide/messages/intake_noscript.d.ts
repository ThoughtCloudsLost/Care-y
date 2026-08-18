/**
* | output |
* | --- |
* | "This form needs JavaScript to encrypt your information before sending it. Please enable JavaScript, or call us instead." |
*
* @param {Intake_NoscriptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_noscript: ((inputs?: Intake_NoscriptInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_NoscriptInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_NoscriptInputs = {};
