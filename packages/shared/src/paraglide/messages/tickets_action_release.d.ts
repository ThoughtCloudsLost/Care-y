/**
* | output |
* | --- |
* | "Release" |
*
* @param {Tickets_Action_ReleaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_release: ((inputs?: Tickets_Action_ReleaseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Action_ReleaseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Action_ReleaseInputs = {};
