/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_TitleInputs */

const en_admin_retention_title = /** @type {(inputs: Admin_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PII Retention`)
};

const es_admin_retention_title = /** @type {(inputs: Admin_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retencion de datos personales`)
};

/**
* | output |
* | --- |
* | "PII Retention" |
*
* @param {Admin_Retention_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_title = /** @type {((inputs?: Admin_Retention_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_title(inputs)
	return es_admin_retention_title(inputs)
});