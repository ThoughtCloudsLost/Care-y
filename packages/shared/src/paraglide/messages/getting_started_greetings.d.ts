/**
* | output |
* | --- |
* | "Set up phone greetings" |
*
* @param {Getting_Started_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings: ((inputs?: Getting_Started_GreetingsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_GreetingsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_GreetingsInputs = {};
