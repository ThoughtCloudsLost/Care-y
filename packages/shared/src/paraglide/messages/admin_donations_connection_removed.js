/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Connection_RemovedInputs */

const en_admin_donations_connection_removed = /** @type {(inputs: Admin_Donations_Connection_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Connection removed`)
};

const es_admin_donations_connection_removed = /** @type {(inputs: Admin_Donations_Connection_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conexión quitada`)
};

const en_xa2_admin_donations_connection_removed = /** @type {(inputs: Admin_Donations_Connection_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònnèctìòn rèmòvèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Connection removed" |
*
* @param {Admin_Donations_Connection_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_connection_removed = /** @type {((inputs?: Admin_Donations_Connection_RemovedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Connection_RemovedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_connection_removed(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_connection_removed(inputs)
	return en_admin_donations_connection_removed(inputs)
});