/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Attach_FileInputs */

const en_ticket_attach_file = /** @type {(inputs: Ticket_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attach file`)
};

const es_ticket_attach_file = /** @type {(inputs: Ticket_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adjuntar archivo`)
};

/**
* | output |
* | --- |
* | "Attach file" |
*
* @param {Ticket_Attach_FileInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_attach_file = /** @type {((inputs?: Ticket_Attach_FileInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Attach_FileInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_attach_file(inputs)
	return es_ticket_attach_file(inputs)
});