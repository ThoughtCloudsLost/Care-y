/**
* | output |
* | --- |
* | "Tap a feature in the list or use the CARE-Y simulator to explore and learn more about CARE-Y." |
*
* @param {Demo_Narrative_Welcome_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_body: ((inputs?: Demo_Narrative_Welcome_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Welcome_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Welcome_BodyInputs = {};
