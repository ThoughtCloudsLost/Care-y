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

const en_xa2_notif_no_queues = /** @type {(inputs: Notif_No_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò qùèùès àvàìlàblè. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No queues available." |
*
* @param {Notif_No_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_no_queues = /** @type {((inputs?: Notif_No_QueuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_No_QueuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_no_queues(inputs)
	if (locale === "en-XA") return en_xa2_notif_no_queues(inputs)
	return en_notif_no_queues(inputs)
});