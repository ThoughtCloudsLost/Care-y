/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_RouteInputs */

const en_admin_quarantine_route = /** @type {(inputs: Admin_Quarantine_RouteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Route to ticket`)
};

const es_admin_quarantine_route = /** @type {(inputs: Admin_Quarantine_RouteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrutar al ticket`)
};

/**
* | output |
* | --- |
* | "Route to ticket" |
*
* @param {Admin_Quarantine_RouteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route = /** @type {((inputs?: Admin_Quarantine_RouteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_RouteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route(inputs)
	return es_admin_quarantine_route(inputs)
});