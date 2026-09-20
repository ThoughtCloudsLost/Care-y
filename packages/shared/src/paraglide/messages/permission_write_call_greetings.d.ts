/**
* | output |
* | --- |
* | "Write call greetings" |
*
* @param {Permission_Write_Call_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_write_call_greetings: ((inputs?: Permission_Write_Call_GreetingsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Write_Call_GreetingsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Write_Call_GreetingsInputs = {};
