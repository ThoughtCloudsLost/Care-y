/**
* | output |
* | --- |
* | "Route calls to specialized teams with separate {queues}." |
*
* @param {Getting_Started_Queues_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues_desc: ((inputs: Getting_Started_Queues_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Queues_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Queues_DescInputs = {
    queues: NonNullable<unknown>;
};
