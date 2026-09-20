/**
* | output |
* | --- |
* | "View own shifts" |
*
* @param {Permission_View_Own_ShiftsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_own_shifts: ((inputs?: Permission_View_Own_ShiftsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_Own_ShiftsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_Own_ShiftsInputs = {};
