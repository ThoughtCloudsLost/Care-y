/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_ErrorInputs */

const en_admin_branding_error = /** @type {(inputs: Admin_Branding_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not save branding. Try again.`)
};

const es_admin_branding_error = /** @type {(inputs: Admin_Branding_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo guardar la marca. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Could not save branding. Try again." |
*
* @param {Admin_Branding_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_error = /** @type {((inputs?: Admin_Branding_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_error(inputs)
	return es_admin_branding_error(inputs)
});