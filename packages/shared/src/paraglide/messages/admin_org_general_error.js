/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_ErrorInputs */

const en_admin_org_general_error = /** @type {(inputs: Admin_Org_General_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not save organization details. Try again.`)
};

const es_admin_org_general_error = /** @type {(inputs: Admin_Org_General_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudieron guardar los datos. Intente de nuevo.`)
};

/**
* | output |
* | --- |
* | "Could not save organization details. Try again." |
*
* @param {Admin_Org_General_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_error = /** @type {((inputs?: Admin_Org_General_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_general_error(inputs)
	return es_admin_org_general_error(inputs)
});