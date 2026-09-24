/**
* | output |
* | --- |
* | "Alias" |
*
* @param {Clients_Sort_AliasInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_sort_alias: ((inputs?: Clients_Sort_AliasInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Sort_AliasInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Sort_AliasInputs = {};
