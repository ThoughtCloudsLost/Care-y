/**
* | output |
* | --- |
* | "Delete {client}?" |
*
* @param {Client_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_title: ((inputs: Client_Delete_Confirm_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_Confirm_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_Confirm_TitleInputs = {
    client: NonNullable<unknown>;
};
