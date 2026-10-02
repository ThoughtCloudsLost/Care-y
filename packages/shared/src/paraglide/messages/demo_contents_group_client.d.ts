/**
* | output |
* | --- |
* | "Client" |
*
* @param {Demo_Contents_Group_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_contents_group_client: ((inputs?: Demo_Contents_Group_ClientInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Contents_Group_ClientInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Contents_Group_ClientInputs = {};
