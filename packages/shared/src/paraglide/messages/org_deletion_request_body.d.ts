/**
* | output |
* | --- |
* | "All of this organization's data will be permanently erased once a {days}-day waiting period ends. An administrator can stop the deletion only during the wait..." |
*
* @param {Org_Deletion_Request_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_request_body: ((inputs: Org_Deletion_Request_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_Request_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_Request_BodyInputs = {
    days: NonNullable<unknown>;
};
