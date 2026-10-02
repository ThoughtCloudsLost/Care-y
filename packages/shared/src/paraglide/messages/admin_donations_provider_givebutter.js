/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Provider_GivebutterInputs */

const en_admin_donations_provider_givebutter = /** @type {(inputs: Admin_Donations_Provider_GivebutterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Givebutter`)
};

const es_admin_donations_provider_givebutter = /** @type {(inputs: Admin_Donations_Provider_GivebutterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Givebutter`)
};

const en_xa2_admin_donations_provider_givebutter = /** @type {(inputs: Admin_Donations_Provider_GivebutterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gìvèbùttèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Givebutter" |
*
* @param {Admin_Donations_Provider_GivebutterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_provider_givebutter = /** @type {((inputs?: Admin_Donations_Provider_GivebutterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Provider_GivebutterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_provider_givebutter(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_provider_givebutter(inputs)
	return en_admin_donations_provider_givebutter(inputs)
});