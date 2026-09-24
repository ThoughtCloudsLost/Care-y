/**
* | output |
* | --- |
* | "{alias} merged here" |
*
* @param {Client_Merge_EventInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_event: ((inputs: Client_Merge_EventInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_EventInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_EventInputs = {
    alias: NonNullable<unknown>;
};
