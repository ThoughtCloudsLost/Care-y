/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_EmptyInputs */

const en_admin_queues_empty = /** @type {(inputs: Admin_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No queues yet. Create one to start routing tickets.`)
};

const es_admin_queues_empty = /** @type {(inputs: Admin_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin colas aun. Crea una para empezar a enrutar tickets.`)
};

/**
* | output |
* | --- |
* | "No queues yet. Create one to start routing tickets." |
*
* @param {Admin_Queues_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_empty = /** @type {((inputs?: Admin_Queues_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_empty(inputs)
	return es_admin_queues_empty(inputs)
});