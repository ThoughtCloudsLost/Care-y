/**
* | output |
* | --- |
* | "This changes the email for {alias} across all their {tickets}." |
*
* @param {Client_Email_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_confirm_body: ((inputs: Client_Email_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Confirm_BodyInputs = {
    alias: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
