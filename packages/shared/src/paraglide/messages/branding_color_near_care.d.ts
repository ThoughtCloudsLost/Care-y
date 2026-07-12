/**
* | output |
* | --- |
* | "This shade sits close to the ochre {volunteers} see on high-priority {tickets}. A nudged shade keeps your identity and their signal apart." |
*
* @param {Branding_Color_Near_CareInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const branding_color_near_care: ((inputs: Branding_Color_Near_CareInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Branding_Color_Near_CareInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Branding_Color_Near_CareInputs = {
    volunteers: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
