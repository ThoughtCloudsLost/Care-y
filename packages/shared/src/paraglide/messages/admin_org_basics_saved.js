/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_Basics_SavedInputs */

const en_admin_org_basics_saved = /** @type {(inputs: Admin_Org_Basics_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization details saved`)
};

const es_admin_org_basics_saved = /** @type {(inputs: Admin_Org_Basics_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos de la organizacion guardados`)
};

/**
* | output |
* | --- |
* | "Organization details saved" |
*
* @param {Admin_Org_Basics_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_basics_saved = /** @type {((inputs?: Admin_Org_Basics_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_Basics_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_basics_saved(inputs)
	return es_admin_org_basics_saved(inputs)
});