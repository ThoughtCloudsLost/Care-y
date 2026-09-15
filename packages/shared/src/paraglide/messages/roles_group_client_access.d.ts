/**
* | output |
* | --- |
* | "The client's access to the case" |
*
* @param {Roles_Group_Client_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_access: ((inputs?: Roles_Group_Client_AccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Client_AccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Client_AccessInputs = {};
