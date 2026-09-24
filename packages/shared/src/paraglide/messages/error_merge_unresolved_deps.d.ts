/**
* | output |
* | --- |
* | "Cannot merge: the secondary {client}'s {ticket} has unresolved dependencies." |
*
* @param {Error_Merge_Unresolved_DepsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_merge_unresolved_deps: ((inputs: Error_Merge_Unresolved_DepsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Merge_Unresolved_DepsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Merge_Unresolved_DepsInputs = {
    client: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
