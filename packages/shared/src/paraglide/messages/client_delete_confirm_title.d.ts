/**
* | output |
* | --- |
* | "Delete {client}?" |
*
* @param {Client_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_title: ((inputs: Client_Delete_Confirm_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_Confirm_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_Confirm_TitleInputs = {
    client: NonNullable<unknown>;
};
