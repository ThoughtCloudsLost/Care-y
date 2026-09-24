/**
* | output |
* | --- |
* | "{permission} for {role}" |
*
* @param {Roles_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_toggle_aria: ((inputs: Roles_Toggle_AriaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Toggle_AriaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Toggle_AriaInputs = {
    permission: NonNullable<unknown>;
    role: NonNullable<unknown>;
};
