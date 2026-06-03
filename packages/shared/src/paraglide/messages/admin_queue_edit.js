/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_EditInputs */

const en_admin_queue_edit = /** @type {(inputs: Admin_Queue_EditInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Edit ${i?.queue}`)
};

const es_admin_queue_edit = /** @type {(inputs: Admin_Queue_EditInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Editar ${i?.queue}`)
};

/**
* | output |
* | --- |
* | "Edit {queue}" |
*
* @param {Admin_Queue_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_edit = /** @type {((inputs: Admin_Queue_EditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_EditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_edit(inputs)
	return es_admin_queue_edit(inputs)
});