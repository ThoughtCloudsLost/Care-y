/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_TitleInputs */

const en_admin_donations_title = /** @type {(inputs: Admin_Donations_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Donation providers`)
};

const es_admin_donations_title = /** @type {(inputs: Admin_Donations_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proveedores de donaciones`)
};

const en_xa2_admin_donations_title = /** @type {(inputs: Admin_Donations_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònàtìòn pròvìdèrs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Donation providers" |
*
* @param {Admin_Donations_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_title = /** @type {((inputs?: Admin_Donations_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_title(inputs)
	return en_admin_donations_title(inputs)
});