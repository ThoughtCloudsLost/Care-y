/**
* | output |
* | --- |
* | "Confirm phone change" |
*
* @param {Client_Phone_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_confirm_title: ((inputs?: Client_Phone_Confirm_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_Confirm_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_Confirm_TitleInputs = {};
