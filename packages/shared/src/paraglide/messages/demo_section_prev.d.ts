/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Section_PrevInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_prev: ((inputs: Demo_Section_PrevInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_PrevInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_PrevInputs = {
    section: NonNullable<unknown>;
};
