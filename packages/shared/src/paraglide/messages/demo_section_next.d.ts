/**
* | output |
* | --- |
* | "Continue to {section}" |
*
* @param {Demo_Section_NextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_next: ((inputs: Demo_Section_NextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_NextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_NextInputs = {
    section: NonNullable<unknown>;
};
