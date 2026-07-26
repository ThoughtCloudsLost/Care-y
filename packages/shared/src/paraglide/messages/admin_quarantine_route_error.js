/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_ErrorInputs */

const en_admin_quarantine_route_error = /** @type {(inputs: Admin_Quarantine_Route_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to route voicemail`)
};

const es_admin_quarantine_route_error = /** @type {(inputs: Admin_Quarantine_Route_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo enrutar el correo de voz`)
};

/**
* | output |
* | --- |
* | "Failed to route voicemail" |
*
* @param {Admin_Quarantine_Route_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_error = /** @type {((inputs?: Admin_Quarantine_Route_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_error(inputs)
	return es_admin_quarantine_route_error(inputs)
});