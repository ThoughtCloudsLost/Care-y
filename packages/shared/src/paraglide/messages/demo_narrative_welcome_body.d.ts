/**
* | output |
* | --- |
* | "Tap a feature in the list or use the tabs inside the CARE-Y simulator to explore. Every piece of data you see is encrypted on the client before it reaches th..." |
*
* @param {Demo_Narrative_Welcome_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_body: ((inputs?: Demo_Narrative_Welcome_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Welcome_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Welcome_BodyInputs = {};
