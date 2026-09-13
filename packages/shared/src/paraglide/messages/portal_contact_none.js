/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Contact_NoneInputs */

const en_portal_contact_none = /** @type {(inputs: Portal_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No contact info on file.`)
};

const es_portal_contact_none = /** @type {(inputs: Portal_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay información de contacto registrada.`)
};

/**
* | output |
* | --- |
* | "No contact info on file." |
*
* @param {Portal_Contact_NoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_none = /** @type {((inputs?: Portal_Contact_NoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_NoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_contact_none(inputs)
	return es_portal_contact_none(inputs)
});