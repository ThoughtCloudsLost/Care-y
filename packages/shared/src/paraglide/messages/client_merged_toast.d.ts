/**
* | output |
* | --- |
* | "{Clients} merged successfully." |
*
* @param {Client_Merged_ToastInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merged_toast: ((inputs: Client_Merged_ToastInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merged_ToastInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merged_ToastInputs = {
    Clients: NonNullable<unknown>;
};
