/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queues: NonNullable<unknown> }} Admin_Presets_Queue_GlobalInputs */

const en_admin_presets_queue_global = /** @type {(inputs: Admin_Presets_Queue_GlobalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`All ${i?.queues}`)
};

const es_admin_presets_queue_global = /** @type {(inputs: Admin_Presets_Queue_GlobalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Todas las ${i?.queues}`)
};

const en_xa2_admin_presets_queue_global = /** @type {(inputs: Admin_Presets_Queue_GlobalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Àll  ••${i?.queues}⟧`)
};

/**
* | output |
* | --- |
* | "All {queues}" |
*
* @param {Admin_Presets_Queue_GlobalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_queue_global = /** @type {((inputs: Admin_Presets_Queue_GlobalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Queue_GlobalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_queue_global(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_queue_global(inputs)
	return en_admin_presets_queue_global(inputs)
});