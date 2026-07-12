/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_DecryptingInputs */

const en_tickets_decrypting = /** @type {(inputs: Tickets_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking...`)
};

const es_tickets_decrypting = /** @type {(inputs: Tickets_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando...`)
};

/**
* | output |
* | --- |
* | "Unlocking..." |
*
* @param {Tickets_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_decrypting = /** @type {((inputs?: Tickets_DecryptingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_DecryptingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_decrypting(inputs)
	return es_tickets_decrypting(inputs)
});