/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Preview_LinksInputs */

const en_admin_branding_preview_links = /** @type {(inputs: Admin_Branding_Preview_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Links`)
};

const es_admin_branding_preview_links = /** @type {(inputs: Admin_Branding_Preview_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlaces`)
};

/**
* | output |
* | --- |
* | "Links" |
*
* @param {Admin_Branding_Preview_LinksInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_preview_links = /** @type {((inputs?: Admin_Branding_Preview_LinksInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Preview_LinksInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_preview_links(inputs)
	return es_admin_branding_preview_links(inputs)
});