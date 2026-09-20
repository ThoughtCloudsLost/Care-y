/**
* | output |
* | --- |
* | "By {queue}" |
*
* @param {Admin_Reports_By_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_by_queue: ((inputs: Admin_Reports_By_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_By_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_By_QueueInputs = {
    queue: NonNullable<unknown>;
};
