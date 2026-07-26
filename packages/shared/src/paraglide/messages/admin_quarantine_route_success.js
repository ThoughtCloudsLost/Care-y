/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_SuccessInputs */

const en_admin_quarantine_route_success = /** @type {(inputs: Admin_Quarantine_Route_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail routed to ticket`)
};

const es_admin_quarantine_route_success = /** @type {(inputs: Admin_Quarantine_Route_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo de voz enrutado al ticket`)
};

/**
* | output |
* | --- |
* | "Voicemail routed to ticket" |
*
* @param {Admin_Quarantine_Route_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_success = /** @type {((inputs?: Admin_Quarantine_Route_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_success(inputs)
	return es_admin_quarantine_route_success(inputs)
});