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

const en_xa2_admin_deactivate = /** @type {(inputs: Admin_DeactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèàctìvàtè •••⟧`)
};

/**
* | output |
* | --- |
* | "Deactivate" |
*
* @param {Admin_DeactivateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate = /** @type {((inputs?: Admin_DeactivateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_DeactivateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_deactivate(inputs)
	if (locale === "en-XA") return en_xa2_admin_deactivate(inputs)
	return en_admin_deactivate(inputs)
});