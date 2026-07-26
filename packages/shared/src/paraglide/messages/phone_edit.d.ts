/**
* | output |
* | --- |
* | "Edit phone number" |
*
* @param {Phone_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const phone_edit: ((inputs?: Phone_EditInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Phone_EditInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Phone_EditInputs = {};
