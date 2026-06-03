/**
* | output |
* | --- |
* | "Set how long personal data is kept before automatic deletion." |
*
* @param {Getting_Started_Retention_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_retention_desc: ((inputs?: Getting_Started_Retention_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Retention_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Retention_DescInputs = {};
