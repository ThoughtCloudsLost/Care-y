/**
* | output |
* | --- |
* | "This user holds the only key to {count} ticket" |
*
* @param {Admin_Deactivate_Sole_Holder_Title_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_title_one: ((inputs: Admin_Deactivate_Sole_Holder_Title_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Deactivate_Sole_Holder_Title_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Deactivate_Sole_Holder_Title_OneInputs = {
    count: NonNullable<unknown>;
};
