/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Timeline_DecryptingInputs */

const en_ticket_timeline_decrypting = /** @type {(inputs: Ticket_Timeline_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking message`)
};

const es_ticket_timeline_decrypting = /** @type {(inputs: Ticket_Timeline_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando mensaje`)
};

const en_xa2_ticket_timeline_decrypting = /** @type {(inputs: Ticket_Timeline_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòckìng mèssàgè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlocking message" |
*
* @param {Ticket_Timeline_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_decrypting = /** @type {((inputs?: Ticket_Timeline_DecryptingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_DecryptingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_decrypting(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_decrypting(inputs)
	return en_ticket_timeline_decrypting(inputs)
});