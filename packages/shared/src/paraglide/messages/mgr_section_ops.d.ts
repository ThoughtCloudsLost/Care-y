/**
* | output |
* | --- |
* | "Operations Snapshot" |
*
* @param {Mgr_Section_OpsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_section_ops: ((inputs?: Mgr_Section_OpsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Section_OpsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Section_OpsInputs = {};
