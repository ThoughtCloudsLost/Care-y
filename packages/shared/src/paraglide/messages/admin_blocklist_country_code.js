/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Country_CodeInputs */

const en_admin_blocklist_country_code = /** @type {(inputs: Admin_Blocklist_Country_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Code`)
};

const es_admin_blocklist_country_code = /** @type {(inputs: Admin_Blocklist_Country_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código`)
};

const en_xa2_admin_blocklist_country_code = /** @type {(inputs: Admin_Blocklist_Country_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còdè ••⟧`)
};

/**
* | output |
* | --- |
* | "Code" |
*
* @param {Admin_Blocklist_Country_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_country_code = /** @type {((inputs?: Admin_Blocklist_Country_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Country_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_country_code(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_country_code(inputs)
	return en_admin_blocklist_country_code(inputs)
});