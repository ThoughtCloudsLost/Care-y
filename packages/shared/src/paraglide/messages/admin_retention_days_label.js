/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Days_LabelInputs */

const en_admin_retention_days_label = /** @type {(inputs: Admin_Retention_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention period (days)`)
};

const es_admin_retention_days_label = /** @type {(inputs: Admin_Retention_Days_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Periodo de retencion (dias)`)
};

/**
* | output |
* | --- |
* | "Retention period (days)" |
*
* @param {Admin_Retention_Days_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_days_label = /** @type {((inputs?: Admin_Retention_Days_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Days_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_days_label(inputs)
	return es_admin_retention_days_label(inputs)
});