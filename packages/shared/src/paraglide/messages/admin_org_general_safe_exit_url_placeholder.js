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

const en_xa2_admin_org_general_safe_exit_url_placeholder = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦https://wèàthèr.gòv ••••••⟧`)
};

/**
* | output |
* | --- |
* | "https://weather.gov" |
*
* @param {Admin_Org_General_Safe_Exit_Url_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_safe_exit_url_placeholder = /** @type {((inputs?: Admin_Org_General_Safe_Exit_Url_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_Safe_Exit_Url_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_general_safe_exit_url_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_general_safe_exit_url_placeholder(inputs)
	return en_admin_org_general_safe_exit_url_placeholder(inputs)
});