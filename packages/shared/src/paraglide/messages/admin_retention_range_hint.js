/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Range_HintInputs */

const en_admin_retention_range_hint = /** @type {(inputs: Admin_Retention_Range_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Between 1 and 3,650 days (10 years)`)
};

const es_admin_retention_range_hint = /** @type {(inputs: Admin_Retention_Range_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entre 1 y 3,650 dias (10 anos)`)
};

/**
* | output |
* | --- |
* | "Between 1 and 3,650 days (10 years)" |
*
* @param {Admin_Retention_Range_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_range_hint = /** @type {((inputs?: Admin_Retention_Range_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Range_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_range_hint(inputs)
	return es_admin_retention_range_hint(inputs)
});