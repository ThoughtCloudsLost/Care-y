/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_ErrorInputs */

const en_ticket_call_error = /** @type {(inputs: Ticket_Call_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call failed. Try again.`)
};

const es_ticket_call_error = /** @type {(inputs: Ticket_Call_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La llamada fallo. Intenta de nuevo.`)
};

const en_xa2_ticket_call_error = /** @type {(inputs: Ticket_Call_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll fàìlèd. Try àgàìn. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Call failed. Try again." |
*
* @param {Ticket_Call_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_error = /** @type {((inputs?: Ticket_Call_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_call_error(inputs)
	if (locale === "en-XA") return en_xa2_ticket_call_error(inputs)
	return en_ticket_call_error(inputs)
});