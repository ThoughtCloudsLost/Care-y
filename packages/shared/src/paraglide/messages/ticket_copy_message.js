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

const en_xa2_ticket_copy_message = /** @type {(inputs: Ticket_Copy_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còpy ••⟧`)
};

/**
* | output |
* | --- |
* | "Copy" |
*
* @param {Ticket_Copy_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_message = /** @type {((inputs?: Ticket_Copy_MessageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Copy_MessageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_copy_message(inputs)
	if (locale === "en-XA") return en_xa2_ticket_copy_message(inputs)
	return en_ticket_copy_message(inputs)
});