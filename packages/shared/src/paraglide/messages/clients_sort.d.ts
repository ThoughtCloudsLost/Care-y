/**
* | output |
* | --- |
* | "Sort {clients}" |
*
* @param {Clients_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort: ((inputs: Clients_SortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_SortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_SortInputs = {
    clients: NonNullable<unknown>;
};
