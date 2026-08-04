/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Permission_LockedInputs */

const en_error_permission_locked = /** @type {(inputs: Error_Permission_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This permission is protected and cannot be changed.`)
};

const es_error_permission_locked = /** @type {(inputs: Error_Permission_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este permiso está protegido y no se puede modificar.`)
};

/**
* | output |
* | --- |
* | "This permission is protected and cannot be changed." |
*
* @param {Error_Permission_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_permission_locked = /** @type {((inputs?: Error_Permission_LockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Permission_LockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_permission_locked(inputs)
	return es_error_permission_locked(inputs)
});