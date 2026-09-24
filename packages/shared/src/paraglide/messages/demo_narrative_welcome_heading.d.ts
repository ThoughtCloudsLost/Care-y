/**
* | output |
* | --- |
* | "Welcome to the CARE-Y handbook" |
*
* @param {Demo_Narrative_Welcome_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_heading: ((inputs?: Demo_Narrative_Welcome_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Welcome_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Welcome_HeadingInputs = {};
