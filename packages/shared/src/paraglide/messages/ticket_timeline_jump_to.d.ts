/**
* | output |
* | --- |
* | "Jump to: {label}, {time}" |
*
* @param {Ticket_Timeline_Jump_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_jump_to: ((inputs: Ticket_Timeline_Jump_ToInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Jump_ToInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Jump_ToInputs = {
    label: NonNullable<unknown>;
    time: NonNullable<unknown>;
};
