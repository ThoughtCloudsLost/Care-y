/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Editor_Save_CreateInputs */

const en_admin_queue_editor_save_create = /** @type {(inputs: Admin_Queue_Editor_Save_CreateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Save ${i?.queue}`)
};

const es_admin_queue_editor_save_create = /** @type {(inputs: Admin_Queue_Editor_Save_CreateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Guardar ${i?.queue}`)
};

/**
* | output |
* | --- |
* | "Save {queue}" |
*
* @param {Admin_Queue_Editor_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_save_create = /** @type {((inputs: Admin_Queue_Editor_Save_CreateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Save_CreateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_save_create(inputs)
	return es_admin_queue_editor_save_create(inputs)
});