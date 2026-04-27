/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_CreateInputs */

const en_admin_queues_create = /** @type {(inputs: Admin_Queues_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Queue`)
};

const es_admin_queues_create = /** @type {(inputs: Admin_Queues_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cola`)
};

/**
* | output |
* | --- |
* | "Create Queue" |
*
* @param {Admin_Queues_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_create = /** @type {((inputs?: Admin_Queues_CreateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_CreateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_create(inputs)
	return es_admin_queues_create(inputs)
});