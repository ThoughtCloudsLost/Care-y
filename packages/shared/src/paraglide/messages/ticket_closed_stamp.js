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

const en_xa2_ticket_closed_stamp = /** @type {(inputs: Ticket_Closed_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Ticket_Closed_StampInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_closed_stamp = /** @type {((inputs?: Ticket_Closed_StampInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Closed_StampInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_closed_stamp(inputs)
	if (locale === "en-XA") return en_xa2_ticket_closed_stamp(inputs)
	return en_ticket_closed_stamp(inputs)
});