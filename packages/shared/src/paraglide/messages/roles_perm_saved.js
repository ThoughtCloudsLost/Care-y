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

const en_xa2_roles_perm_saved = /** @type {(inputs: Roles_Perm_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèrmìssìòn ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Permission updated" |
*
* @param {Roles_Perm_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_perm_saved = /** @type {((inputs?: Roles_Perm_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Perm_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_perm_saved(inputs)
	if (locale === "en-XA") return en_xa2_roles_perm_saved(inputs)
	return en_roles_perm_saved(inputs)
});