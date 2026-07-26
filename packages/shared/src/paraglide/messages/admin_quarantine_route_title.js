/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_TitleInputs */

const en_admin_quarantine_route_title = /** @type {(inputs: Admin_Quarantine_Route_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Route voicemail`)
};

const es_admin_quarantine_route_title = /** @type {(inputs: Admin_Quarantine_Route_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrutar correo de voz`)
};

/**
* | output |
* | --- |
* | "Route voicemail" |
*
* @param {Admin_Quarantine_Route_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_title = /** @type {((inputs?: Admin_Quarantine_Route_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_title(inputs)
	return es_admin_quarantine_route_title(inputs)
});