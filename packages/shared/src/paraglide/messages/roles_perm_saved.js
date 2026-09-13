/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Perm_SavedInputs */

const en_roles_perm_saved = /** @type {(inputs: Roles_Perm_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permission updated`)
};

const es_roles_perm_saved = /** @type {(inputs: Roles_Perm_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permiso actualizado`)
};

/**
* | output |
* | --- |
* | "Permission updated" |
*
* @param {Roles_Perm_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_perm_saved = /** @type {((inputs?: Roles_Perm_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Perm_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_perm_saved(inputs)
	return es_roles_perm_saved(inputs)
});