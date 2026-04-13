/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Contact_MethodInputs */

const en_ticket_contact_method = /** @type {(inputs: Ticket_Contact_MethodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contact`)
};

const es_ticket_contact_method = /** @type {(inputs: Ticket_Contact_MethodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contacto`)
};

/**
* | output |
* | --- |
* | "Contact" |
*
* @param {Ticket_Contact_MethodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_contact_method = /** @type {((inputs?: Ticket_Contact_MethodInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Contact_MethodInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_contact_method(inputs)
	return es_ticket_contact_method(inputs)
});