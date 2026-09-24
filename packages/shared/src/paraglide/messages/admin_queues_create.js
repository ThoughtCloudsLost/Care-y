/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queues_CreateInputs */

const en_admin_queues_create = /** @type {(inputs: Admin_Queues_CreateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create ${i?.Queue}`)
};

const es_admin_queues_create = /** @type {(inputs: Admin_Queues_CreateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear ${i?.queue}`)
};

const en_xa2_admin_queues_create = /** @type {(inputs: Admin_Queues_CreateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè  •••${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "Create {Queue}" |
*
* @param {Admin_Queues_CreateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_create = /** @type {((inputs: Admin_Queues_CreateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_CreateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_create(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_create(inputs)
	return en_admin_queues_create(inputs)
});