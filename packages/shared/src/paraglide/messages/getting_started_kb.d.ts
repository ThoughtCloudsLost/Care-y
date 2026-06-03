/**
* | output |
* | --- |
* | "Add {knowledgeBase} articles" |
*
* @param {Getting_Started_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb: ((inputs: Getting_Started_KbInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_KbInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_KbInputs = {
    knowledgeBase: NonNullable<unknown>;
};
