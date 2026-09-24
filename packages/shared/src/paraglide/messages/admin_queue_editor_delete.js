/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queue_Editor_DeleteInputs */

const en_admin_queue_editor_delete = /** @type {(inputs: Admin_Queue_Editor_DeleteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete ${i?.Queue}`)
};

const es_admin_queue_editor_delete = /** @type {(inputs: Admin_Queue_Editor_DeleteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Eliminar ${i?.queue}`)
};

const en_xa2_admin_queue_editor_delete = /** @type {(inputs: Admin_Queue_Editor_DeleteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè  •••${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "Delete {Queue}" |
*
* @param {Admin_Queue_Editor_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_delete = /** @type {((inputs: Admin_Queue_Editor_DeleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_DeleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_delete(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_delete(inputs)
	return en_admin_queue_editor_delete(inputs)
});