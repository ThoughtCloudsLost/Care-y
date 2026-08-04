/**
* | output |
* | --- |
* | "{permission} for {role}" |
*
* @param {Roles_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_toggle_aria: ((inputs: Roles_Toggle_AriaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Toggle_AriaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Toggle_AriaInputs = {
    permission: NonNullable<unknown>;
    role: NonNullable<unknown>;
};
