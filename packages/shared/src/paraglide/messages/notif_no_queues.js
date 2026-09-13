/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_No_QueuesInputs */

const en_notif_no_queues = /** @type {(inputs: Notif_No_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No queues available.`)
};

const es_notif_no_queues = /** @type {(inputs: Notif_No_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay colas disponibles.`)
};

/**
* | output |
* | --- |
* | "No queues available." |
*
* @param {Notif_No_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_no_queues = /** @type {((inputs?: Notif_No_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_No_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_no_queues(inputs)
	return es_notif_no_queues(inputs)
});