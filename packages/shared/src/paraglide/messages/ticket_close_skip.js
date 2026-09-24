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

const en_xa2_ticket_close_skip = /** @type {(inputs: Ticket_Close_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Skìp ••⟧`)
};

/**
* | output |
* | --- |
* | "Skip" |
*
* @param {Ticket_Close_SkipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_close_skip = /** @type {((inputs?: Ticket_Close_SkipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Close_SkipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_close_skip(inputs)
	if (locale === "en-XA") return en_xa2_ticket_close_skip(inputs)
	return en_ticket_close_skip(inputs)
});