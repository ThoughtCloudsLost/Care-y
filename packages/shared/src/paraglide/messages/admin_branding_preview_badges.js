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

/**
* | output |
* | --- |
* | "Badges" |
*
* @param {Admin_Branding_Preview_BadgesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_preview_badges = /** @type {((inputs?: Admin_Branding_Preview_BadgesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Preview_BadgesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_preview_badges(inputs)
	return es_admin_branding_preview_badges(inputs)
});