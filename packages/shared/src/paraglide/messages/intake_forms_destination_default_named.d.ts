/**
* | output |
* | --- |
* | "Default intake queue ({name})" |
*
* @param {Intake_Forms_Destination_Default_NamedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_default_named: ((inputs: Intake_Forms_Destination_Default_NamedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Destination_Default_NamedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Destination_Default_NamedInputs = {
    name: NonNullable<unknown>;
};
