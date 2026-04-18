/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_ErrorInputs */

const en_admin_retention_error = /** @type {(inputs: Admin_Retention_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to update retention setting`)
};

const es_admin_retention_error = /** @type {(inputs: Admin_Retention_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al actualizar la configuracion de retencion`)
};

/**
* | output |
* | --- |
* | "Failed to update retention setting" |
*
* @param {Admin_Retention_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_error = /** @type {((inputs?: Admin_Retention_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_error(inputs)
	return es_admin_retention_error(inputs)
});