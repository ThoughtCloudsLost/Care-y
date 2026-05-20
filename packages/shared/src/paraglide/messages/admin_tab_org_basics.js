/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_Org_BasicsInputs */

const en_admin_tab_org_basics = /** @type {(inputs: Admin_Tab_Org_BasicsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Basics`)
};

const es_admin_tab_org_basics = /** @type {(inputs: Admin_Tab_Org_BasicsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos basicos`)
};

/**
* | output |
* | --- |
* | "Basics" |
*
* @param {Admin_Tab_Org_BasicsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_org_basics = /** @type {((inputs?: Admin_Tab_Org_BasicsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Org_BasicsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_org_basics(inputs)
	return es_admin_tab_org_basics(inputs)
});