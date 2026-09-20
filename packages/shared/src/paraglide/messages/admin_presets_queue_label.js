/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Admin_Presets_Queue_LabelInputs */

const en_admin_presets_queue_label = /** @type {(inputs: Admin_Presets_Queue_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} (optional)`)
};

const es_admin_presets_queue_label = /** @type {(inputs: Admin_Presets_Queue_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} (opcional)`)
};

/**
* | output |
* | --- |
* | "{Queue} (optional)" |
*
* @param {Admin_Presets_Queue_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_queue_label = /** @type {((inputs: Admin_Presets_Queue_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Queue_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_queue_label(inputs)
	return en_admin_presets_queue_label(inputs)
});