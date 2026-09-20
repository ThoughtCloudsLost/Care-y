/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_ErrorInputs */

const en_admin_retention_error = /** @type {(inputs: Admin_Retention_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to update retention setting`)
};

const es_admin_retention_error = /** @type {(inputs: Admin_Retention_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al actualizar la configuración de retención`)
};

const en_xa2_admin_retention_error = /** @type {(inputs: Admin_Retention_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fàìlèd tò ùpdàtè rètèntìòn sèttìng •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Failed to update retention setting" |
*
* @param {Admin_Retention_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_error = /** @type {((inputs?: Admin_Retention_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_error(inputs)
	return en_admin_retention_error(inputs)
});