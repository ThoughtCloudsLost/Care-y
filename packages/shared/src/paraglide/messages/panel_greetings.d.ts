/**
* | output |
* | --- |
* | "Greetings" |
*
* @param {Panel_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_greetings: ((inputs?: Panel_GreetingsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_GreetingsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_GreetingsInputs = {};
