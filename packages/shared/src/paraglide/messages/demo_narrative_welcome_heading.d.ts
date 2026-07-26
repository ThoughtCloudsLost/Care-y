/**
* | output |
* | --- |
* | "Welcome to the CARE-Y demo" |
*
* @param {Demo_Narrative_Welcome_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_heading: ((inputs?: Demo_Narrative_Welcome_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Welcome_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Welcome_HeadingInputs = {};
