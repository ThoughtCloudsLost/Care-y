/**
* | output |
* | --- |
* | "Alias" |
*
* @param {Clients_Sort_AliasInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort_alias: ((inputs?: Clients_Sort_AliasInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Sort_AliasInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Sort_AliasInputs = {};
