/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_SubmitInputs */

const en_admin_quarantine_route_submit = /** @type {(inputs: Admin_Quarantine_Route_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Route`)
};

const es_admin_quarantine_route_submit = /** @type {(inputs: Admin_Quarantine_Route_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrutar`)
};

/**
* | output |
* | --- |
* | "Route" |
*
* @param {Admin_Quarantine_Route_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_submit = /** @type {((inputs?: Admin_Quarantine_Route_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_submit(inputs)
	return es_admin_quarantine_route_submit(inputs)
});