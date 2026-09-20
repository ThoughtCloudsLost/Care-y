/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_RetentionInputs */

const en_admin_tab_retention = /** @type {(inputs: Admin_Tab_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention`)
};

const es_admin_tab_retention = /** @type {(inputs: Admin_Tab_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retención`)
};

const en_xa2_admin_tab_retention = /** @type {(inputs: Admin_Tab_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètèntìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Retention" |
*
* @param {Admin_Tab_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_retention = /** @type {((inputs?: Admin_Tab_RetentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_RetentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_retention(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_retention(inputs)
	return en_admin_tab_retention(inputs)
});