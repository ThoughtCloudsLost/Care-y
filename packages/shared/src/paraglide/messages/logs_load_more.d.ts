/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Logs_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_load_more: ((inputs?: Logs_Load_MoreInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Load_MoreInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Load_MoreInputs = {};
