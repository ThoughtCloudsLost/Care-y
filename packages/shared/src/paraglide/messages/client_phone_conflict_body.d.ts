/**
* | output |
* | --- |
* | "This number belongs to {alias}. Merge instead?" |
*
* @param {Client_Phone_Conflict_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_body: ((inputs: Client_Phone_Conflict_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_Conflict_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_Conflict_BodyInputs = {
    alias: NonNullable<unknown>;
};
