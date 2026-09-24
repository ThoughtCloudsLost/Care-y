/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Admin_Clients_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_clients_title: ((inputs: Admin_Clients_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Clients_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Clients_TitleInputs = {
    Clients: NonNullable<unknown>;
};
