/**
* | output |
* | --- |
* | "Type {slug} to confirm." |
*
* @param {Org_Deletion_Confirm_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_confirm_hint: ((inputs: Org_Deletion_Confirm_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_Confirm_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_Confirm_HintInputs = {
    slug: NonNullable<unknown>;
};
