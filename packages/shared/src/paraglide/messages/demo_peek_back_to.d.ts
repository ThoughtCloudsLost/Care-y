/**
* | output |
* | --- |
* | "Back to {section}" |
*
* @param {Demo_Peek_Back_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_peek_back_to: ((inputs: Demo_Peek_Back_ToInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Peek_Back_ToInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Peek_Back_ToInputs = {
    section: NonNullable<unknown>;
};
