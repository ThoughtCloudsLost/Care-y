/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Admin_Retention_Set_TitleInputs */

const en_admin_retention_set_title = /** @type {(inputs: Admin_Retention_Set_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Set data retention to ${i?.days} days?`)
};

const es_admin_retention_set_title = /** @type {(inputs: Admin_Retention_Set_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Establecer retencion de datos en ${i?.days} dias?`)
};

/**
* | output |
* | --- |
* | "Set data retention to {days} days?" |
*
* @param {Admin_Retention_Set_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_set_title = /** @type {((inputs: Admin_Retention_Set_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Set_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_set_title(inputs)
	return es_admin_retention_set_title(inputs)
});