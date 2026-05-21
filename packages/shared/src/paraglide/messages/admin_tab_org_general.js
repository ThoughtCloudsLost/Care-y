/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_Org_GeneralInputs */

const en_admin_tab_org_general = /** @type {(inputs: Admin_Tab_Org_GeneralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General`)
};

const es_admin_tab_org_general = /** @type {(inputs: Admin_Tab_Org_GeneralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General`)
};

/**
* | output |
* | --- |
* | "General" |
*
* @param {Admin_Tab_Org_GeneralInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_org_general = /** @type {((inputs?: Admin_Tab_Org_GeneralInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Org_GeneralInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_org_general(inputs)
	return es_admin_tab_org_general(inputs)
});