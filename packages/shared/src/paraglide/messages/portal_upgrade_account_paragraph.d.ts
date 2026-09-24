/**
* | output |
* | --- |
* | "Or create an account and sign in at {url} instead, so you no longer depend on the link at all. With an account, losing the link no longer means losing access..." |
*
* @param {Portal_Upgrade_Account_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_account_paragraph: ((inputs: Portal_Upgrade_Account_ParagraphInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_Account_ParagraphInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_Account_ParagraphInputs = {
    url: NonNullable<unknown>;
};
