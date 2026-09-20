/**
* | output |
* | --- |
* | "Deleting removes the {client} record, contact information, and portal access (no {tickets} on file). There is no way to recover deleted data." |
*
* @param {Client_Delete_Confirm_Body_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_body_zero: ((inputs: Client_Delete_Confirm_Body_ZeroInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_Confirm_Body_ZeroInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_Confirm_Body_ZeroInputs = {
    client: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
