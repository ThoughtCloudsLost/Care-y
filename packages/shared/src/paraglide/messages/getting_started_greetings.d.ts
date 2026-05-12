/**
* | output |
* | --- |
* | "Set up phone greetings" |
*
* @param {Getting_Started_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings: ((inputs?: Getting_Started_GreetingsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_GreetingsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_GreetingsInputs = {};
