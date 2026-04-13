/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Copy_MessageInputs */

const en_ticket_copy_message = /** @type {(inputs: Ticket_Copy_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy`)
};

const es_ticket_copy_message = /** @type {(inputs: Ticket_Copy_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar`)
};

/**
* | output |
* | --- |
* | "Copy" |
*
* @param {Ticket_Copy_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_message = /** @type {((inputs?: Ticket_Copy_MessageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Copy_MessageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_copy_message(inputs)
	return es_ticket_copy_message(inputs)
});