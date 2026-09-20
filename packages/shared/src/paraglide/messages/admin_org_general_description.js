/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_DescriptionInputs */

const en_admin_org_general_description = /** @type {(inputs: Admin_Org_General_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, default language, and country calling code.`)
};

const es_admin_org_general_description = /** @type {(inputs: Admin_Org_General_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de la organización, idioma predeterminado y código de país.`)
};

const en_xa2_admin_org_general_description = /** @type {(inputs: Admin_Org_General_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn nàmè, dèfàùlt làngùàgè, ànd còùntry càllìng còdè. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization name, default language, and country calling code." |
*
* @param {Admin_Org_General_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_description = /** @type {((inputs?: Admin_Org_General_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_general_description(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_general_description(inputs)
	return en_admin_org_general_description(inputs)
});