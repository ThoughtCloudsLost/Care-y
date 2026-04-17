/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_DeactivateInputs */

const en_admin_deactivate = /** @type {(inputs: Admin_DeactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deactivate`)
};

const es_admin_deactivate = /** @type {(inputs: Admin_DeactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivar`)
};

/**
* | output |
* | --- |
* | "Deactivate" |
*
* @param {Admin_DeactivateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate = /** @type {((inputs?: Admin_DeactivateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_DeactivateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_deactivate(inputs)
	return es_admin_deactivate(inputs)
});