/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_ReactivateInputs */

const en_admin_reactivate = /** @type {(inputs: Admin_ReactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reactivate`)
};

const es_admin_reactivate = /** @type {(inputs: Admin_ReactivateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reactivar`)
};

/**
* | output |
* | --- |
* | "Reactivate" |
*
* @param {Admin_ReactivateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate = /** @type {((inputs?: Admin_ReactivateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_ReactivateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reactivate(inputs)
	return es_admin_reactivate(inputs)
});