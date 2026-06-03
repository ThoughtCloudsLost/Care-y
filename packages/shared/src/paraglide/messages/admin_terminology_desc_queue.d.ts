/**
* | output |
* | --- |
* | "How work items are organized and routed to team members." |
*
* @param {Admin_Terminology_Desc_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_queue: ((inputs?: Admin_Terminology_Desc_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Desc_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Desc_QueueInputs = {};
