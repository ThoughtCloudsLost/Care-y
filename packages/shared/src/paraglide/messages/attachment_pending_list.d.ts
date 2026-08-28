/**
* | output |
* | --- |
* | "Files on this message" |
*
* @param {Attachment_Pending_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_pending_list: ((inputs?: Attachment_Pending_ListInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_Pending_ListInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_Pending_ListInputs = {};
