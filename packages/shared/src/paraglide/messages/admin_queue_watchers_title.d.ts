/**
* | output |
* | --- |
* | "Watchers" |
*
* @param {Admin_Queue_Watchers_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watchers_title: ((inputs?: Admin_Queue_Watchers_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Watchers_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Watchers_TitleInputs = {};
