/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Access_TicketsInputs */

const en_vol_access_tickets = /** @type {(inputs: Vol_Access_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Take and reply to tickets in your queues`)
};

const es_vol_access_tickets = /** @type {(inputs: Vol_Access_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tomar y responder tickets en tus colas`)
};

/**
* | output |
* | --- |
* | "Take and reply to tickets in your queues" |
*
* @param {Vol_Access_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_tickets = /** @type {((inputs?: Vol_Access_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_access_tickets(inputs)
	return es_vol_access_tickets(inputs)
});