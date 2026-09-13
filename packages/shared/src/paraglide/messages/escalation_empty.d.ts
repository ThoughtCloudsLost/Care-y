/**
* | output |
* | --- |
* | "No escalation alerts for this queue yet." |
*
* @param {Escalation_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_empty: ((inputs?: Escalation_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_EmptyInputs = {};
