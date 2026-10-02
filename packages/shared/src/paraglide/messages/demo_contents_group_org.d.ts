/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Demo_Contents_Group_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_contents_group_org: ((inputs?: Demo_Contents_Group_OrgInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Contents_Group_OrgInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Contents_Group_OrgInputs = {};
