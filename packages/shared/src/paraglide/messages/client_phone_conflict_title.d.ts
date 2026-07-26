/**
* | output |
* | --- |
* | "Phone conflict" |
*
* @param {Client_Phone_Conflict_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_title: ((inputs?: Client_Phone_Conflict_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_Conflict_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_Conflict_TitleInputs = {};
