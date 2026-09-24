/**
* | output |
* | --- |
* | "Add {knowledgeBase} articles" |
*
* @param {Getting_Started_KbInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb: ((inputs: Getting_Started_KbInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_KbInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_KbInputs = {
    knowledgeBase: NonNullable<unknown>;
};
