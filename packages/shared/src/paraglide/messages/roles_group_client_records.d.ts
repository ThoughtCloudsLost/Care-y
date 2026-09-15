/**
* | output |
* | --- |
* | "Client records" |
*
* @param {Roles_Group_Client_RecordsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_records: ((inputs?: Roles_Group_Client_RecordsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Client_RecordsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Client_RecordsInputs = {};
