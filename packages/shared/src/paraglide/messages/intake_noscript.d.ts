/**
* | output |
* | --- |
* | "This form needs JavaScript to encrypt your information before sending it. Please enable JavaScript, or call us instead." |
*
* @param {Intake_NoscriptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_noscript: ((inputs?: Intake_NoscriptInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_NoscriptInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_NoscriptInputs = {};
