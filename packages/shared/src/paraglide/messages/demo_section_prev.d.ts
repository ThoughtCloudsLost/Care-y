/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Section_PrevInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_prev: ((inputs: Demo_Section_PrevInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_PrevInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_PrevInputs = {
    section: NonNullable<unknown>;
};
