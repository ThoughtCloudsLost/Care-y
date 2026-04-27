/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_DisableInputs */

const en_admin_retention_disable = /** @type {(inputs: Admin_Retention_DisableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disable`)
};

const es_admin_retention_disable = /** @type {(inputs: Admin_Retention_DisableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivar`)
};

/**
* | output |
* | --- |
* | "Disable" |
*
* @param {Admin_Retention_DisableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_disable = /** @type {((inputs?: Admin_Retention_DisableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_DisableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_disable(inputs)
	return es_admin_retention_disable(inputs)
});