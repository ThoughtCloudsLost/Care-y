/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_Safe_Exit_Url_LabelInputs */

const en_admin_org_general_safe_exit_url_label = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quick-exit URL`)
};

const es_admin_org_general_safe_exit_url_label = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`URL de salida rapida`)
};

/**
* | output |
* | --- |
* | "Quick-exit URL" |
*
* @param {Admin_Org_General_Safe_Exit_Url_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_safe_exit_url_label = /** @type {((inputs?: Admin_Org_General_Safe_Exit_Url_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_Safe_Exit_Url_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_general_safe_exit_url_label(inputs)
	return es_admin_org_general_safe_exit_url_label(inputs)
});