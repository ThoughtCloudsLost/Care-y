/**
* | output |
* | --- |
* | "Delete {client}" |
*
* @param {Client_Delete_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_action: ((inputs: Client_Delete_ActionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_ActionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_ActionInputs = {
    client: NonNullable<unknown>;
};
