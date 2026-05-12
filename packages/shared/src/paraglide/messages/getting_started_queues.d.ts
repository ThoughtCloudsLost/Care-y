/**
* | output |
* | --- |
* | "Set up additional {queues}" |
*
* @param {Getting_Started_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues: ((inputs: Getting_Started_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_QueuesInputs = {
    queues: NonNullable<unknown>;
};
