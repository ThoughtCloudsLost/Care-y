/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Close_SkipInputs */

const en_ticket_close_skip = /** @type {(inputs: Ticket_Close_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skip`)
};

const es_ticket_close_skip = /** @type {(inputs: Ticket_Close_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Omitir`)
};

/**
* | output |
* | --- |
* | "Skip" |
*
* @param {Ticket_Close_SkipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_close_skip = /** @type {((inputs?: Ticket_Close_SkipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Close_SkipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_close_skip(inputs)
	return es_ticket_close_skip(inputs)
});