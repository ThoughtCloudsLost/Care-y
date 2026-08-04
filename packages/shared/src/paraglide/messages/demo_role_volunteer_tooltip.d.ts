/**
* | output |
* | --- |
* | "Volunteer user: can view and manage their own tickets. Admin-only screens are blocked by real server middleware." |
*
* @param {Demo_Role_Volunteer_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_tooltip: ((inputs?: Demo_Role_Volunteer_TooltipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Volunteer_TooltipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Volunteer_TooltipInputs = {};
