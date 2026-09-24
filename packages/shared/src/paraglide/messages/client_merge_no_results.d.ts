/**
* | output |
* | --- |
* | "No matching {clients} found" |
*
* @param {Client_Merge_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_no_results: ((inputs: Client_Merge_No_ResultsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_No_ResultsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_No_ResultsInputs = {
    clients: NonNullable<unknown>;
};
