/**
* | output |
* | --- |
* | "This organization will be deleted after {date}." |
*
* @param {Org_Deletion_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_pending: ((inputs: Org_Deletion_PendingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_PendingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_PendingInputs = {
    date: NonNullable<unknown>;
};
