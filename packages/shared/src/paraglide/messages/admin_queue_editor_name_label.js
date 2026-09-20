/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queue_Editor_Name_LabelInputs */

const en_admin_queue_editor_name_label = /** @type {(inputs: Admin_Queue_Editor_Name_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} Name`)
};

const es_admin_queue_editor_name_label = /** @type {(inputs: Admin_Queue_Editor_Name_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nombre de la ${i?.queue}`)
};

const en_xa2_admin_queue_editor_name_label = /** @type {(inputs: Admin_Queue_Editor_Name_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} Nàmè ••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} Name" |
*
* @param {Admin_Queue_Editor_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_label = /** @type {((inputs: Admin_Queue_Editor_Name_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Name_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_name_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_name_label(inputs)
	return en_admin_queue_editor_name_label(inputs)
});