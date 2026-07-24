/**
* | output |
* | --- |
* | "This shade sits close to the red {volunteers} see on urgent {tickets}. The suggested shade keeps your identity and their signal apart." |
*
* @param {Branding_Color_Near_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const branding_color_near_urgent: ((inputs: Branding_Color_Near_UrgentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Branding_Color_Near_UrgentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Branding_Color_Near_UrgentInputs = {
    volunteers: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
