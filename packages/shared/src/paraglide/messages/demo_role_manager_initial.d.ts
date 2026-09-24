/**
* | output |
* | --- |
* | "M" |
*
* @param {Demo_Role_Manager_InitialInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_initial: ((inputs?: Demo_Role_Manager_InitialInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Manager_InitialInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Manager_InitialInputs = {};
