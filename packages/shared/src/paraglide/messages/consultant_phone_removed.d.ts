/**
* | output |
* | --- |
* | "Phone removed" |
*
* @param {Consultant_Phone_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_removed: ((inputs?: Consultant_Phone_RemovedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_RemovedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_RemovedInputs = {};
