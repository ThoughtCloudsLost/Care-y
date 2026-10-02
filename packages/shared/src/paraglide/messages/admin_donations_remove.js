/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_RemoveInputs */

const en_admin_donations_remove = /** @type {(inputs: Admin_Donations_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove connection`)
};

const es_admin_donations_remove = /** @type {(inputs: Admin_Donations_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quitar conexión`)
};

const en_xa2_admin_donations_remove = /** @type {(inputs: Admin_Donations_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè cònnèctìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove connection" |
*
* @param {Admin_Donations_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_remove = /** @type {((inputs?: Admin_Donations_RemoveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_RemoveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_remove(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_remove(inputs)
	return en_admin_donations_remove(inputs)
});