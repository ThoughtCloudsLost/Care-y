/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Range_HintInputs */

const en_admin_retention_range_hint = /** @type {(inputs: Admin_Retention_Range_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Between 1 and 3,650 days (10 years)`)
};

const es_admin_retention_range_hint = /** @type {(inputs: Admin_Retention_Range_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entre 1 y 3,650 días (10 años)`)
};

const en_xa2_admin_retention_range_hint = /** @type {(inputs: Admin_Retention_Range_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bètwèèn 1 ànd 3,650 dàys (10 yèàrs) •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Between 1 and 3,650 days (10 years)" |
*
* @param {Admin_Retention_Range_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_range_hint = /** @type {((inputs?: Admin_Retention_Range_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Range_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_range_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_range_hint(inputs)
	return en_admin_retention_range_hint(inputs)
});