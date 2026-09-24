/**
* | output |
* | --- |
* | "Permanently deletes the {client}, their {count} {ticket}, and all associated messages, notes, recordings, and attachments. There is no way to recover deleted..." |
*
* @param {Client_Delete_Confirm_Body_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_body_one: ((inputs: Client_Delete_Confirm_Body_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_Confirm_Body_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_Confirm_Body_OneInputs = {
    client: NonNullable<unknown>;
    count: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
