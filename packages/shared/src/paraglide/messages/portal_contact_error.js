/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Contact_ErrorInputs */

const en_portal_contact_error = /** @type {(inputs: Portal_Contact_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not load your contact info. Try again later.`)
};

const es_portal_contact_error = /** @type {(inputs: Portal_Contact_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cargar tu información de contacto. Intenta de nuevo más tarde.`)
};

/**
* | output |
* | --- |
* | "Could not load your contact info. Try again later." |
*
* @param {Portal_Contact_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_error = /** @type {((inputs?: Portal_Contact_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_contact_error(inputs)
	return es_portal_contact_error(inputs)
});