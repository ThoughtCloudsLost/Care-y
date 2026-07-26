/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_Client_LabelInputs */

const en_admin_quarantine_route_client_label = /** @type {(inputs: Admin_Quarantine_Route_Client_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select or create a caller`)
};

const es_admin_quarantine_route_client_label = /** @type {(inputs: Admin_Quarantine_Route_Client_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar o crear un llamante`)
};

/**
* | output |
* | --- |
* | "Select or create a caller" |
*
* @param {Admin_Quarantine_Route_Client_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_client_label = /** @type {((inputs?: Admin_Quarantine_Route_Client_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_Client_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_client_label(inputs)
	return es_admin_quarantine_route_client_label(inputs)
});