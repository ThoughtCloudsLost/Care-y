/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Priority_LowInputs */

const en_ticket_new_priority_low = /** @type {(inputs: Ticket_New_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const es_ticket_new_priority_low = /** @type {(inputs: Ticket_New_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Baja`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Ticket_New_Priority_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_low = /** @type {((inputs?: Ticket_New_Priority_LowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_LowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_priority_low(inputs)
	return es_ticket_new_priority_low(inputs)
});