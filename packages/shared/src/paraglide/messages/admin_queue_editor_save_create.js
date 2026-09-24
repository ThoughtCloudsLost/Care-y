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

const en_xa2_admin_queue_editor_save_create = /** @type {(inputs: Admin_Queue_Editor_Save_CreateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sàvè  ••${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "Save {queue}" |
*
* @param {Admin_Queue_Editor_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_save_create = /** @type {((inputs: Admin_Queue_Editor_Save_CreateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Save_CreateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_save_create(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_save_create(inputs)
	return en_admin_queue_editor_save_create(inputs)
});