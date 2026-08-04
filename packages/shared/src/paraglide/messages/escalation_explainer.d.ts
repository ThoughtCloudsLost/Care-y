/**
* | output |
* | --- |
* | "Alerts notify people; the priority ladder above changes the case itself." |
*
* @param {Escalation_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_explainer: ((inputs?: Escalation_ExplainerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_ExplainerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_ExplainerInputs = {};
