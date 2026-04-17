/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_TitleInputs */

const en_admin_org_title = /** @type {(inputs: Admin_Org_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_admin_org_title = /** @type {(inputs: Admin_Org_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizacion`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Admin_Org_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_title = /** @type {((inputs?: Admin_Org_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_title(inputs)
	return es_admin_org_title(inputs)
});