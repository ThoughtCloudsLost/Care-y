/**
* | output |
* | --- |
* | "No matching {clients} found" |
*
* @param {Client_Merge_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_no_results: ((inputs: Client_Merge_No_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_No_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_No_ResultsInputs = {
    clients: NonNullable<unknown>;
};
