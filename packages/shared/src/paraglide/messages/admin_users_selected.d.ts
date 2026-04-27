/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Admin_Users_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_selected: ((inputs: Admin_Users_SelectedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_SelectedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_SelectedInputs = {
    count: NonNullable<unknown>;
};
