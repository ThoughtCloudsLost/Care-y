/**
* | output |
* | --- |
* | "{alias} merged here" |
*
* @param {Client_Merge_EventInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_event: ((inputs: Client_Merge_EventInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_EventInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_EventInputs = {
    alias: NonNullable<unknown>;
};
