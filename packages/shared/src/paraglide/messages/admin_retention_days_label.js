/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Days_LabelInputs */

const en_admin_retention_days_label = /** @type {(inputs: Admin_Retention_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention period (days)`)
};

const es_admin_retention_days_label = /** @type {(inputs: Admin_Retention_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Periodo de retención (días)`)
};

const en_xa2_admin_retention_days_label = /** @type {(inputs: Admin_Retention_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètèntìòn pèrìòd (dàys) •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Retention period (days)" |
*
* @param {Admin_Retention_Days_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_days_label = /** @type {((inputs?: Admin_Retention_Days_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Days_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_days_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_days_label(inputs)
	return en_admin_retention_days_label(inputs)
});