/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Contact_TitleInputs */

const en_portal_contact_title = /** @type {(inputs: Portal_Contact_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your contact info`)
};

const es_portal_contact_title = /** @type {(inputs: Portal_Contact_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu información de contacto`)
};

/**
* | output |
* | --- |
* | "Your contact info" |
*
* @param {Portal_Contact_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_title = /** @type {((inputs?: Portal_Contact_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_contact_title(inputs)
	return en_portal_contact_title(inputs)
});