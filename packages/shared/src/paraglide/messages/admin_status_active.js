/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Status_ActiveInputs */

const en_admin_status_active = /** @type {(inputs: Admin_Status_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Active`)
};

const es_admin_status_active = /** @type {(inputs: Admin_Status_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activo`)
};

const en_xa2_admin_status_active = /** @type {(inputs: Admin_Status_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Active" |
*
* @param {Admin_Status_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_status_active = /** @type {((inputs?: Admin_Status_ActiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Status_ActiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_status_active(inputs)
	if (locale === "en-XA") return en_xa2_admin_status_active(inputs)
	return en_admin_status_active(inputs)
});