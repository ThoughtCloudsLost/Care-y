/**
* | output |
* | --- |
* | "No {clients} found" |
*
* @param {Clients_Empty_StateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_empty_state: ((inputs: Clients_Empty_StateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Empty_StateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Empty_StateInputs = {
    clients: NonNullable<unknown>;
};
