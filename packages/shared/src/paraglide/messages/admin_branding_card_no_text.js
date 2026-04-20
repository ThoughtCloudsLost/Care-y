/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Card_No_TextInputs */

const en_admin_branding_card_no_text = /** @type {(inputs: Admin_Branding_Card_No_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No welcome text set`)
};

const es_admin_branding_card_no_text = /** @type {(inputs: Admin_Branding_Card_No_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se ha establecido texto de bienvenida`)
};

/**
* | output |
* | --- |
* | "No welcome text set" |
*
* @param {Admin_Branding_Card_No_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_no_text = /** @type {((inputs?: Admin_Branding_Card_No_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_No_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_card_no_text(inputs)
	return es_admin_branding_card_no_text(inputs)
});