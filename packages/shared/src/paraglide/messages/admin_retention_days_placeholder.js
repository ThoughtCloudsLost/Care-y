/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Days_PlaceholderInputs */

const en_admin_retention_days_placeholder = /** @type {(inputs: Admin_Retention_Days_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disabled`)
};

const es_admin_retention_days_placeholder = /** @type {(inputs: Admin_Retention_Days_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivado`)
};

/**
* | output |
* | --- |
* | "Disabled" |
*
* @param {Admin_Retention_Days_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_days_placeholder = /** @type {((inputs?: Admin_Retention_Days_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Days_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_days_placeholder(inputs)
	return es_admin_retention_days_placeholder(inputs)
});