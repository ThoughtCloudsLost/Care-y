/**
* | output |
* | --- |
* | "This address belongs to {alias}. Merge instead?" |
*
* @param {Client_Email_Conflict_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_email_conflict_body: ((inputs: Client_Email_Conflict_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Conflict_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Conflict_BodyInputs = {
    alias: NonNullable<unknown>;
};
