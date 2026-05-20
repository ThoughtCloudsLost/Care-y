/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_Basics_SaveInputs */

const en_admin_org_basics_save = /** @type {(inputs: Admin_Org_Basics_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save changes`)
};

const es_admin_org_basics_save = /** @type {(inputs: Admin_Org_Basics_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar cambios`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Org_Basics_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_basics_save = /** @type {((inputs?: Admin_Org_Basics_SaveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_Basics_SaveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_basics_save(inputs)
	return es_admin_org_basics_save(inputs)
});