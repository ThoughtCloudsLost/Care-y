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

const en_xa2_admin_quarantine_route_client_label = /** @type {(inputs: Admin_Quarantine_Route_Client_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct òr crèàtè à càllèr ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Select or create a caller" |
*
* @param {Admin_Quarantine_Route_Client_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_client_label = /** @type {((inputs?: Admin_Quarantine_Route_Client_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_Client_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_route_client_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_route_client_label(inputs)
	return en_admin_quarantine_route_client_label(inputs)
});