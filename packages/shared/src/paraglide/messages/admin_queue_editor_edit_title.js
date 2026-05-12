/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queue_Editor_Edit_TitleInputs */

const en_admin_queue_editor_edit_title = /** @type {(inputs: Admin_Queue_Editor_Edit_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Edit ${i?.Queue}`)
};

const es_admin_queue_editor_edit_title = /** @type {(inputs: Admin_Queue_Editor_Edit_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Editar ${i?.queue}`)
};

/**
* | output |
* | --- |
* | "Edit {Queue}" |
*
* @param {Admin_Queue_Editor_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_edit_title = /** @type {((inputs: Admin_Queue_Editor_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_edit_title(inputs)
	return es_admin_queue_editor_edit_title(inputs)
});