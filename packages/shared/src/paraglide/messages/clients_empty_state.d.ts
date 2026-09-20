/**
* | output |
* | --- |
* | "No {clients} found" |
*
* @param {Clients_Empty_StateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_empty_state: ((inputs: Clients_Empty_StateInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Empty_StateInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Empty_StateInputs = {
    clients: NonNullable<unknown>;
};
