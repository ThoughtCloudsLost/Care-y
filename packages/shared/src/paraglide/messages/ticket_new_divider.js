/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_DividerInputs */

const en_ticket_new_divider = /** @type {(inputs: Ticket_New_DividerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New`)
};

const es_ticket_new_divider = /** @type {(inputs: Ticket_New_DividerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo`)
};

/**
* | output |
* | --- |
* | "New" |
*
* @param {Ticket_New_DividerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_divider = /** @type {((inputs?: Ticket_New_DividerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_DividerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_divider(inputs)
	return es_ticket_new_divider(inputs)
});