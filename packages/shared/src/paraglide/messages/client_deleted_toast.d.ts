/**
* | output |
* | --- |
* | "{Client} deleted." |
*
* @param {Client_Deleted_ToastInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_deleted_toast: ((inputs: Client_Deleted_ToastInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Deleted_ToastInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Deleted_ToastInputs = {
    Client: NonNullable<unknown>;
};
