/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Cannot_Change_Own_RoleInputs */

const en_error_cannot_change_own_role = /** @type {(inputs: Error_Cannot_Change_Own_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You cannot change your own role.`)
};

const es_error_cannot_change_own_role = /** @type {(inputs: Error_Cannot_Change_Own_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No puedes cambiar tu propio rol.`)
};

/**
* | output |
* | --- |
* | "You cannot change your own role." |
*
* @param {Error_Cannot_Change_Own_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_change_own_role = /** @type {((inputs?: Error_Cannot_Change_Own_RoleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Change_Own_RoleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_cannot_change_own_role(inputs)
	return es_error_cannot_change_own_role(inputs)
});