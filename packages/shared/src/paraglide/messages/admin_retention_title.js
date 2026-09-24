/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_TitleInputs */

const en_admin_retention_title = /** @type {(inputs: Admin_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personal Identifying Information Retention`)
};

const es_admin_retention_title = /** @type {(inputs: Admin_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retención de información personal identificable`)
};

const en_xa2_admin_retention_title = /** @type {(inputs: Admin_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèrsònàl Ìdèntìfyìng Ìnfòrmàtìòn Rètèntìòn •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Personal Identifying Information Retention" |
*
* @param {Admin_Retention_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_title = /** @type {((inputs?: Admin_Retention_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_title(inputs)
	return en_admin_retention_title(inputs)
});