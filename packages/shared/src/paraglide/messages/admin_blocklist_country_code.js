/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Country_CodeInputs */

const en_admin_blocklist_country_code = /** @type {(inputs: Admin_Blocklist_Country_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Code`)
};

const es_admin_blocklist_country_code = /** @type {(inputs: Admin_Blocklist_Country_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Codigo`)
};

/**
* | output |
* | --- |
* | "Code" |
*
* @param {Admin_Blocklist_Country_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_country_code = /** @type {((inputs?: Admin_Blocklist_Country_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Country_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_country_code(inputs)
	return es_admin_blocklist_country_code(inputs)
});