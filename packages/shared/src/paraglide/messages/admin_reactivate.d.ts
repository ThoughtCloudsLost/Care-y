/**
* | output |
* | --- |
* | "Reactivate" |
*
* @param {Admin_ReactivateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate: ((inputs?: Admin_ReactivateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_ReactivateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_ReactivateInputs = {};
