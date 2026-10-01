/**
* | output |
* | --- |
* | "Stop deletion" |
*
* @param {Org_Deletion_Cancel_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_cancel_button: ((inputs?: Org_Deletion_Cancel_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_Cancel_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_Cancel_ButtonInputs = {};
