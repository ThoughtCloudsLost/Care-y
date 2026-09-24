/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown>, clients: NonNullable<unknown> }} Admin_Branding_DescriptionInputs */

const en_admin_branding_description = /** @type {(inputs: Admin_Branding_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Logo, colors, and text shown to ${i?.volunteers} and ${i?.clients}.`)
};

const es_admin_branding_description = /** @type {(inputs: Admin_Branding_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Logotipo, colores y texto que se muestran a ${i?.volunteers} y ${i?.clients}.`)
};

const en_xa2_admin_branding_description = /** @type {(inputs: Admin_Branding_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Lògò, còlòrs, ànd tèxt shòwn tò  ••••••••••${i?.volunteers} ànd  ••${i?.clients}. •⟧`)
};

/**
* | output |
* | --- |
* | "Logo, colors, and text shown to {volunteers} and {clients}." |
*
* @param {Admin_Branding_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_description = /** @type {((inputs: Admin_Branding_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_description(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_description(inputs)
	return en_admin_branding_description(inputs)
});