/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Dashboard_Kb_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_heading: ((inputs: Dashboard_Kb_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_HeadingInputs = {
    KnowledgeBase: NonNullable<unknown>;
};
