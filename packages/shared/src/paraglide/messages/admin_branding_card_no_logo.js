/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Card_No_LogoInputs */

const en_admin_branding_card_no_logo = /** @type {(inputs: Admin_Branding_Card_No_LogoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No logo uploaded`)
};

const es_admin_branding_card_no_logo = /** @type {(inputs: Admin_Branding_Card_No_LogoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se ha subido un logotipo`)
};

/**
* | output |
* | --- |
* | "No logo uploaded" |
*
* @param {Admin_Branding_Card_No_LogoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_no_logo = /** @type {((inputs?: Admin_Branding_Card_No_LogoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_No_LogoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_card_no_logo(inputs)
	return es_admin_branding_card_no_logo(inputs)
});