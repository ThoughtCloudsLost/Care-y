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

const en_xa2_ticket_contact_method = /** @type {(inputs: Ticket_Contact_MethodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntàct •••⟧`)
};

/**
* | output |
* | --- |
* | "Contact" |
*
* @param {Ticket_Contact_MethodInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_contact_method = /** @type {((inputs?: Ticket_Contact_MethodInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Contact_MethodInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_contact_method(inputs)
	if (locale === "en-XA") return en_xa2_ticket_contact_method(inputs)
	return en_ticket_contact_method(inputs)
});