/**
* | output |
* | --- |
* | "Cannot delete the last queue." |
*
* @param {Error_Cannot_Delete_Last_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_delete_last_queue: ((inputs?: Error_Cannot_Delete_Last_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Delete_Last_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Delete_Last_QueueInputs = {};
