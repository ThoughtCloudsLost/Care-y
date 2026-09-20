/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Contact_Footer_GenericInputs */

const en_portal_contact_footer_generic = /** @type {(inputs: Portal_Contact_Footer_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This is the contact info on file to reach you.`)
};

const es_portal_contact_footer_generic = /** @type {(inputs: Portal_Contact_Footer_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta es la información de contacto registrada para comunicarse contigo.`)
};

const en_xa2_portal_contact_footer_generic = /** @type {(inputs: Portal_Contact_Footer_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs ìs thè còntàct ìnfò òn fìlè tò rèàch yòù. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This is the contact info on file to reach you." |
*
* @param {Portal_Contact_Footer_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_contact_footer_generic = /** @type {((inputs?: Portal_Contact_Footer_GenericInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_Footer_GenericInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_contact_footer_generic(inputs)
	if (locale === "en-XA") return en_xa2_portal_contact_footer_generic(inputs)
	return en_portal_contact_footer_generic(inputs)
});