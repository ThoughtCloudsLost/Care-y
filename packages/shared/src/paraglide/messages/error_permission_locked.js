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

const en_xa2_error_permission_locked = /** @type {(inputs: Error_Permission_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs pèrmìssìòn ìs pròtèctèd ànd cànnòt bè chàngèd. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This permission is protected and cannot be changed." |
*
* @param {Error_Permission_LockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_permission_locked = /** @type {((inputs?: Error_Permission_LockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Permission_LockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_permission_locked(inputs)
	if (locale === "en-XA") return en_xa2_error_permission_locked(inputs)
	return en_error_permission_locked(inputs)
});