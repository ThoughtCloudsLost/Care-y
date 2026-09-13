/**
* | output |
* | --- |
* | "Merge {clients}" |
*
* @param {Client_Email_Conflict_MergeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_conflict_merge: ((inputs: Client_Email_Conflict_MergeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Conflict_MergeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Conflict_MergeInputs = {
    clients: NonNullable<unknown>;
};
