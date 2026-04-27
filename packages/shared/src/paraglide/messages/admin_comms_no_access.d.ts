/**
* | output |
* | --- |
* | "You do not have permission to access communications settings." |
*
* @param {Admin_Comms_No_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_comms_no_access: ((inputs?: Admin_Comms_No_AccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Comms_No_AccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Comms_No_AccessInputs = {};
