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

const en_xa2_tickets_decrypting = /** @type {(inputs: Tickets_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòckìng... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlocking..." |
*
* @param {Tickets_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_decrypting = /** @type {((inputs?: Tickets_DecryptingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_DecryptingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_decrypting(inputs)
	if (locale === "en-XA") return en_xa2_tickets_decrypting(inputs)
	return en_tickets_decrypting(inputs)
});