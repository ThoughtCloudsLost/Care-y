/**
* | output |
* | --- |
* | "Default intake queue ({name})" |
*
* @param {Intake_Forms_Destination_Default_NamedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_default_named: ((inputs: Intake_Forms_Destination_Default_NamedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Destination_Default_NamedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Destination_Default_NamedInputs = {
    name: NonNullable<unknown>;
};
