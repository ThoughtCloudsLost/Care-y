/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Preview_BadgesInputs */

const en_admin_branding_preview_badges = /** @type {(inputs: Admin_Branding_Preview_BadgesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Badges`)
};

const es_admin_branding_preview_badges = /** @type {(inputs: Admin_Branding_Preview_BadgesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Insignias`)
};

const en_xa2_admin_branding_preview_badges = /** @type {(inputs: Admin_Branding_Preview_BadgesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàdgès ••⟧`)
};

/**
* | output |
* | --- |
* | "Badges" |
*
* @param {Admin_Branding_Preview_BadgesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_preview_badges = /** @type {((inputs?: Admin_Branding_Preview_BadgesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Preview_BadgesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_preview_badges(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_preview_badges(inputs)
	return en_admin_branding_preview_badges(inputs)
});