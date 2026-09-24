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

const en_xa2_admin_quarantine_route = /** @type {(inputs: Admin_Quarantine_RouteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròùtè tò tìckèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Route to ticket" |
*
* @param {Admin_Quarantine_RouteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route = /** @type {((inputs?: Admin_Quarantine_RouteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_RouteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_route(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_route(inputs)
	return en_admin_quarantine_route(inputs)
});