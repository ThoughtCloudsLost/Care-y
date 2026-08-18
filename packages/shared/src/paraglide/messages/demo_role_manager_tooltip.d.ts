/**
* | output |
* | --- |
* | "Manager with access to volunteers, queues, and reports. Cannot change org settings or infrastructure." |
*
* @param {Demo_Role_Manager_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_tooltip: ((inputs?: Demo_Role_Manager_TooltipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Manager_TooltipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Manager_TooltipInputs = {};
