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

const en_xa2_admin_branding_card_logo_label = /** @type {(inputs: Admin_Branding_Card_Logo_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògò ••⟧`)
};

/**
* | output |
* | --- |
* | "Logo" |
*
* @param {Admin_Branding_Card_Logo_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_logo_label = /** @type {((inputs?: Admin_Branding_Card_Logo_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_Logo_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_card_logo_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_card_logo_label(inputs)
	return en_admin_branding_card_logo_label(inputs)
});