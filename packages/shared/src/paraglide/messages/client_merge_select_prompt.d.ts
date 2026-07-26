/**
* | output |
* | --- |
* | "Select which {client} survives:" |
*
* @param {Client_Merge_Select_PromptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_select_prompt: ((inputs: Client_Merge_Select_PromptInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Select_PromptInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Select_PromptInputs = {
    client: NonNullable<unknown>;
};
