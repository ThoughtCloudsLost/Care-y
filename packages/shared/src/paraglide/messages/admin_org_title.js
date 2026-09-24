/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_TitleInputs */

const en_admin_org_title = /** @type {(inputs: Admin_Org_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_admin_org_title = /** @type {(inputs: Admin_Org_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organización`)
};

const en_xa2_admin_org_title = /** @type {(inputs: Admin_Org_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Admin_Org_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_title = /** @type {((inputs?: Admin_Org_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_title(inputs)
	return en_admin_org_title(inputs)
});