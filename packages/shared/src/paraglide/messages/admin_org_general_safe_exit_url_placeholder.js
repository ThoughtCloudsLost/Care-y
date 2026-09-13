/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_Safe_Exit_Url_PlaceholderInputs */

const en_admin_org_general_safe_exit_url_placeholder = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://weather.gov`)
};

const es_admin_org_general_safe_exit_url_placeholder = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://weather.gov`)
};

/**
* | output |
* | --- |
* | "https://weather.gov" |
*
* @param {Admin_Org_General_Safe_Exit_Url_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_safe_exit_url_placeholder = /** @type {((inputs?: Admin_Org_General_Safe_Exit_Url_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_Safe_Exit_Url_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_general_safe_exit_url_placeholder(inputs)
	return es_admin_org_general_safe_exit_url_placeholder(inputs)
});