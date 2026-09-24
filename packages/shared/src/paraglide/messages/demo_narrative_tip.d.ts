/**
* | output |
* | --- |
* | "Select a feature from the list, scroll, or interact with the CARE-Y app in the simulator to learn more." |
*
* @param {Demo_Narrative_TipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tip: ((inputs?: Demo_Narrative_TipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_TipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_TipInputs = {};
