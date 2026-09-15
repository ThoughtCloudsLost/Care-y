/**
* | output |
* | --- |
* | "Record what callers hear" |
*
* @param {Permission_Write_Call_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_write_call_greetings: ((inputs?: Permission_Write_Call_GreetingsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Write_Call_GreetingsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Write_Call_GreetingsInputs = {};
