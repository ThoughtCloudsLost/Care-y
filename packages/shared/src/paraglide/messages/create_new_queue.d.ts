/**
* | output |
* | --- |
* | "New Queue" |
*
* @param {Create_New_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_queue: ((inputs?: Create_New_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_QueueInputs = {};
