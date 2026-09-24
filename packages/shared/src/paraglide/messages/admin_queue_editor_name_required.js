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

const en_xa2_admin_queue_editor_name_required = /** @type {(inputs: Admin_Queue_Editor_Name_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} nàmè ìs rèqùìrèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} name is required" |
*
* @param {Admin_Queue_Editor_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_required = /** @type {((inputs: Admin_Queue_Editor_Name_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Name_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_name_required(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_name_required(inputs)
	return en_admin_queue_editor_name_required(inputs)
});