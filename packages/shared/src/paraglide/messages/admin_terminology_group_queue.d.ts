/**
* | output |
* | --- |
* | "Work group" |
*
* @param {Admin_Terminology_Group_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_queue: ((inputs?: Admin_Terminology_Group_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Group_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Group_QueueInputs = {};
