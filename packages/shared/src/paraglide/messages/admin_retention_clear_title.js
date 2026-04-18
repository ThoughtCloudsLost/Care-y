/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Clear_TitleInputs */

const en_admin_retention_clear_title = /** @type {(inputs: Admin_Retention_Clear_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disable automatic data deletion?`)
};

const es_admin_retention_clear_title = /** @type {(inputs: Admin_Retention_Clear_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivar la eliminacion automatica de datos?`)
};

/**
* | output |
* | --- |
* | "Disable automatic data deletion?" |
*
* @param {Admin_Retention_Clear_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_clear_title = /** @type {((inputs?: Admin_Retention_Clear_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Clear_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_clear_title(inputs)
	return es_admin_retention_clear_title(inputs)
});