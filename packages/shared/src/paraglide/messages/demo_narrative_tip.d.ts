/**
* | output |
* | --- |
* | "Select a feature from the list, scroll down, or interact with the CARE-Y app in the phone to learn more about what it can do." |
*
* @param {Demo_Narrative_TipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tip: ((inputs?: Demo_Narrative_TipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_TipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_TipInputs = {};
