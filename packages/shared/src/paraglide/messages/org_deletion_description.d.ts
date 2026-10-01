/**
* | output |
* | --- |
* | "Deleting this organization permanently erases all of its data, files and recordings. Deletion begins once a {days}-day waiting period has passed, and an admi..." |
*
* @param {Org_Deletion_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_description: ((inputs: Org_Deletion_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_DescriptionInputs = {
    days: NonNullable<unknown>;
};
