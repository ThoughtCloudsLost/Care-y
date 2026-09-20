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

const en_xa2_vol_access_tickets = /** @type {(inputs: Vol_Access_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàkè ànd rèply tò tìckèts ìn yòùr qùèùès ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Take and reply to tickets in your queues" |
*
* @param {Vol_Access_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_access_tickets = /** @type {((inputs?: Vol_Access_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_access_tickets(inputs)
	if (locale === "en-XA") return en_xa2_vol_access_tickets(inputs)
	return en_vol_access_tickets(inputs)
});