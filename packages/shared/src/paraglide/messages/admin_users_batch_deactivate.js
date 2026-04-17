/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Batch_DeactivateInputs */

const en_admin_users_batch_deactivate = /** @type {(inputs: Admin_Users_Batch_DeactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deactivate selected`)
};

const es_admin_users_batch_deactivate = /** @type {(inputs: Admin_Users_Batch_DeactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivar seleccionados`)
};

/**
* | output |
* | --- |
* | "Deactivate selected" |
*
* @param {Admin_Users_Batch_DeactivateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_batch_deactivate = /** @type {((inputs?: Admin_Users_Batch_DeactivateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Batch_DeactivateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_batch_deactivate(inputs)
	return es_admin_users_batch_deactivate(inputs)
});