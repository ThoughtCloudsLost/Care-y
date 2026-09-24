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

const en_xa2_admin_org_general_error = /** @type {(inputs: Admin_Org_General_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt sàvè òrgànìzàtìòn dètàìls. Try àgàìn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not save organization details. Try again." |
*
* @param {Admin_Org_General_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_error = /** @type {((inputs?: Admin_Org_General_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_general_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_general_error(inputs)
	return en_admin_org_general_error(inputs)
});