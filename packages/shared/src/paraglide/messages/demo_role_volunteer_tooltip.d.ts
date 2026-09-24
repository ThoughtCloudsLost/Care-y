/**
* | output |
* | --- |
* | "Volunteer with access to their own tickets. Admin only screens are blocked by real server middleware." |
*
* @param {Demo_Role_Volunteer_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_tooltip: ((inputs?: Demo_Role_Volunteer_TooltipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Volunteer_TooltipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Volunteer_TooltipInputs = {};
