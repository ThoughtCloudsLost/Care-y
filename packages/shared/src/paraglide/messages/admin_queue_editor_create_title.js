/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queue_Editor_Create_TitleInputs */

const en_admin_queue_editor_create_title = /** @type {(inputs: Admin_Queue_Editor_Create_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create ${i?.Queue}`)
};

const es_admin_queue_editor_create_title = /** @type {(inputs: Admin_Queue_Editor_Create_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear ${i?.queue}`)
};

const en_xa2_admin_queue_editor_create_title = /** @type {(inputs: Admin_Queue_Editor_Create_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè  •••${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "Create {Queue}" |
*
* @param {Admin_Queue_Editor_Create_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_create_title = /** @type {((inputs: Admin_Queue_Editor_Create_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Create_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_create_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_create_title(inputs)
	return en_admin_queue_editor_create_title(inputs)
});