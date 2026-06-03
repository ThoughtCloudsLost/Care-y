/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queue_Editor_Name_RequiredInputs */

const en_admin_queue_editor_name_required = /** @type {(inputs: Admin_Queue_Editor_Name_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} name is required`)
};

const es_admin_queue_editor_name_required = /** @type {(inputs: Admin_Queue_Editor_Name_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El nombre de la ${i?.queue} es obligatorio`)
};

/**
* | output |
* | --- |
* | "{Queue} name is required" |
*
* @param {Admin_Queue_Editor_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_required = /** @type {((inputs: Admin_Queue_Editor_Name_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Name_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_name_required(inputs)
	return es_admin_queue_editor_name_required(inputs)
});