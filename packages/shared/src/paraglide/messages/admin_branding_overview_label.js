/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Overview_LabelInputs */

const en_admin_branding_overview_label = /** @type {(inputs: Admin_Branding_Overview_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding overview`)
};

const es_admin_branding_overview_label = /** @type {(inputs: Admin_Branding_Overview_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista general de la marca`)
};

/**
* | output |
* | --- |
* | "Branding overview" |
*
* @param {Admin_Branding_Overview_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_overview_label = /** @type {((inputs?: Admin_Branding_Overview_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Overview_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_overview_label(inputs)
	return es_admin_branding_overview_label(inputs)
});