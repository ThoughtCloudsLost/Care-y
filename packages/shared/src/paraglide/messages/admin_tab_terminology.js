/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_TerminologyInputs */

const en_admin_tab_terminology = /** @type {(inputs: Admin_Tab_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology`)
};

const es_admin_tab_terminology = /** @type {(inputs: Admin_Tab_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminología`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Admin_Tab_TerminologyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_terminology = /** @type {((inputs?: Admin_Tab_TerminologyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_TerminologyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_terminology(inputs)
	return es_admin_tab_terminology(inputs)
});