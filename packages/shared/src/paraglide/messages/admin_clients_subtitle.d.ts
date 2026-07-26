/**
* | output |
* | --- |
* | "Browse and manage {client} records" |
*
* @param {Admin_Clients_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_clients_subtitle: ((inputs: Admin_Clients_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Clients_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Clients_SubtitleInputs = {
    client: NonNullable<unknown>;
};
