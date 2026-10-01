/**
* | output |
* | --- |
* | "Delete this organization?" |
*
* @param {Org_Deletion_Request_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_request_title: ((inputs?: Org_Deletion_Request_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_Request_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_Request_TitleInputs = {};
