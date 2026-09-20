/**
* | output |
* | --- |
* | "Permanently deletes the {client}, their {count} {tickets}, and all associated messages, notes, recordings, and attachments. There is no way to recover delete..." |
*
* @param {Client_Delete_Confirm_Body_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_body_other: ((inputs: Client_Delete_Confirm_Body_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_Confirm_Body_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_Confirm_Body_OtherInputs = {
    client: NonNullable<unknown>;
    count: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
