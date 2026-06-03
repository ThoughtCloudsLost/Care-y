/**
* | output |
* | --- |
* | "{Queue} not found." |
*
* @param {Error_Queue_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_queue_not_found: ((inputs: Error_Queue_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Queue_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Queue_Not_FoundInputs = {
    Queue: NonNullable<unknown>;
};
