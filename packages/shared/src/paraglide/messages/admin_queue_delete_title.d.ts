/**
* | output |
* | --- |
* | "Delete {name}" |
*
* @param {Admin_Queue_Delete_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_title: ((inputs: Admin_Queue_Delete_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Delete_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Delete_TitleInputs = {
    name: NonNullable<unknown>;
};
