/**
* | output |
* | --- |
* | "This user holds the only key to {count} tickets" |
*
* @param {Admin_Deactivate_Sole_Holder_Title_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_title_other: ((inputs: Admin_Deactivate_Sole_Holder_Title_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Deactivate_Sole_Holder_Title_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Deactivate_Sole_Holder_Title_OtherInputs = {
    count: NonNullable<unknown>;
};
