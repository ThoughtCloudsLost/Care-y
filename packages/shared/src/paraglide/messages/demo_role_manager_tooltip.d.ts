/**
* | output |
* | --- |
* | "Manager with access to volunteers, queues, and reports. Cannot change org settings or infrastructure." |
*
* @param {Demo_Role_Manager_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_tooltip: ((inputs?: Demo_Role_Manager_TooltipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Manager_TooltipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Manager_TooltipInputs = {};
