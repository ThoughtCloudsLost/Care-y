/**
* | output |
* | --- |
* | "{secondaryAlias} will be merged into {primaryAlias}. All {tickets} from {secondaryAlias} will move to {primaryAlias}. This can be undone." |
*
* @param {Client_Merge_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_confirm_body: ((inputs: Client_Merge_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Confirm_BodyInputs = {
    secondaryAlias: NonNullable<unknown>;
    primaryAlias: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
