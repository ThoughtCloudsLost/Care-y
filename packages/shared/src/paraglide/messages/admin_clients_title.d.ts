/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Admin_Clients_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_clients_title: ((inputs: Admin_Clients_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Clients_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Clients_TitleInputs = {
    Clients: NonNullable<unknown>;
};
