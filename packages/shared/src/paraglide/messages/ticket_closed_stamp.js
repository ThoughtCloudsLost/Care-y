/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Closed_StampInputs */

const en_ticket_closed_stamp = /** @type {(inputs: Ticket_Closed_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed`)
};

const es_ticket_closed_stamp = /** @type {(inputs: Ticket_Closed_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrado`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Ticket_Closed_StampInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_closed_stamp = /** @type {((inputs?: Ticket_Closed_StampInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Closed_StampInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_closed_stamp(inputs)
	return es_ticket_closed_stamp(inputs)
});