/**
* | output |
* | --- |
* | "Balances add up what {volunteers} have recorded. They track money set aside for each purpose, not a bank account." |
*
* @param {Funds_Page_IntroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const funds_page_intro: ((inputs: Funds_Page_IntroInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Funds_Page_IntroInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Funds_Page_IntroInputs = {
    volunteers: NonNullable<unknown>;
};
