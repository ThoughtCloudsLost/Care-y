/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_CallInputs */

const en_ticket_call = /** @type {(inputs: Ticket_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call client`)
};

const es_ticket_call = /** @type {(inputs: Ticket_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar al cliente`)
};

/**
* | output |
* | --- |
* | "Call client" |
*
* @param {Ticket_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call = /** @type {((inputs?: Ticket_CallInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_CallInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_call(inputs)
	return es_ticket_call(inputs)
});