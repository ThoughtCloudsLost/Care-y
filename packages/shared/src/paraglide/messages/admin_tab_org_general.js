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

const en_xa2_admin_tab_org_general = /** @type {(inputs: Admin_Tab_Org_GeneralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràl •••⟧`)
};

/**
* | output |
* | --- |
* | "General" |
*
* @param {Admin_Tab_Org_GeneralInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_org_general = /** @type {((inputs?: Admin_Tab_Org_GeneralInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Org_GeneralInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_org_general(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_org_general(inputs)
	return en_admin_tab_org_general(inputs)
});