/**
* | output |
* | --- |
* | "{Client} deleted." |
*
* @param {Client_Deleted_ToastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_deleted_toast: ((inputs: Client_Deleted_ToastInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Deleted_ToastInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Deleted_ToastInputs = {
    Client: NonNullable<unknown>;
};
