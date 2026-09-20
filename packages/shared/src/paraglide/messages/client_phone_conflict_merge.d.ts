/**
* | output |
* | --- |
* | "Merge {clients}" |
*
* @param {Client_Phone_Conflict_MergeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_merge: ((inputs: Client_Phone_Conflict_MergeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_Conflict_MergeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_Conflict_MergeInputs = {
    clients: NonNullable<unknown>;
};
