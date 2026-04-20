/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Card_Logo_LabelInputs */

const en_admin_branding_card_logo_label = /** @type {(inputs: Admin_Branding_Card_Logo_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logo`)
};

const es_admin_branding_card_logo_label = /** @type {(inputs: Admin_Branding_Card_Logo_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logotipo`)
};

/**
* | output |
* | --- |
* | "Logo" |
*
* @param {Admin_Branding_Card_Logo_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_logo_label = /** @type {((inputs?: Admin_Branding_Card_Logo_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_Logo_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_card_logo_label(inputs)
	return es_admin_branding_card_logo_label(inputs)
});