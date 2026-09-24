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

const en_xa2_admin_retention_disable = /** @type {(inputs: Admin_Retention_DisableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsàblè •••⟧`)
};

/**
* | output |
* | --- |
* | "Disable" |
*
* @param {Admin_Retention_DisableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_disable = /** @type {((inputs?: Admin_Retention_DisableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_DisableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_disable(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_disable(inputs)
	return en_admin_retention_disable(inputs)
});