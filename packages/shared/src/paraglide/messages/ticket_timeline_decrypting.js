/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Timeline_DecryptingInputs */

const en_ticket_timeline_decrypting = /** @type {(inputs: Ticket_Timeline_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decrypting message`)
};

const es_ticket_timeline_decrypting = /** @type {(inputs: Ticket_Timeline_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descifrando mensaje`)
};

/**
* | output |
* | --- |
* | "Decrypting message" |
*
* @param {Ticket_Timeline_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_decrypting = /** @type {((inputs?: Ticket_Timeline_DecryptingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_DecryptingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_decrypting(inputs)
	return es_ticket_timeline_decrypting(inputs)
});