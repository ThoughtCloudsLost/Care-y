/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Connection_SavedInputs */

const en_admin_donations_connection_saved = /** @type {(inputs: Admin_Donations_Connection_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Connection saved`)
};

const es_admin_donations_connection_saved = /** @type {(inputs: Admin_Donations_Connection_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conexión guardada`)
};

const en_xa2_admin_donations_connection_saved = /** @type {(inputs: Admin_Donations_Connection_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònnèctìòn sàvèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Connection saved" |
*
* @param {Admin_Donations_Connection_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_connection_saved = /** @type {((inputs?: Admin_Donations_Connection_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Connection_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_connection_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_connection_saved(inputs)
	return en_admin_donations_connection_saved(inputs)
});