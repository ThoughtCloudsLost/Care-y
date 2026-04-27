/**
* | output |
* | --- |
* | "Grid view" |
*
* @param {Admin_Users_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_view_grid: ((inputs?: Admin_Users_View_GridInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_View_GridInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_View_GridInputs = {};
