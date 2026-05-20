/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_Basics_DescriptionInputs */

const en_admin_org_basics_description = /** @type {(inputs: Admin_Org_Basics_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, default language, and country calling code.`)
};

const es_admin_org_basics_description = /** @type {(inputs: Admin_Org_Basics_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de la organizacion, idioma predeterminado y codigo de pais.`)
};

/**
* | output |
* | --- |
* | "Organization name, default language, and country calling code." |
*
* @param {Admin_Org_Basics_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_basics_description = /** @type {((inputs?: Admin_Org_Basics_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_Basics_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_basics_description(inputs)
	return es_admin_org_basics_description(inputs)
});