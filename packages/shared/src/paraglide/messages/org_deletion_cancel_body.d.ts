/**
* | output |
* | --- |
* | "The organization and its data will be kept. A new request would start a new {days}-day waiting period." |
*
* @param {Org_Deletion_Cancel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_cancel_body: ((inputs: Org_Deletion_Cancel_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_Cancel_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_Cancel_BodyInputs = {
    days: NonNullable<unknown>;
};
