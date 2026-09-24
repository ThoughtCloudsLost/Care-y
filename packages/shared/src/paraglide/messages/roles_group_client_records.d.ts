/**
* | output |
* | --- |
* | "Client records" |
*
* @param {Roles_Group_Client_RecordsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_records: ((inputs?: Roles_Group_Client_RecordsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Client_RecordsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Client_RecordsInputs = {};
