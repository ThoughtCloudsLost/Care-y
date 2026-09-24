/**
* | output |
* | --- |
* | "Merge {Clients}" |
*
* @param {Client_Merge_Confirm_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_confirm_button: ((inputs: Client_Merge_Confirm_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Confirm_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Confirm_ButtonInputs = {
    Clients: NonNullable<unknown>;
};
