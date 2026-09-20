/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Invalid_Target_UserInputs */

const en_error_invalid_target_user = /** @type {(inputs: Error_Invalid_Target_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cannot assign to this user.`)
};

const es_error_invalid_target_user = /** @type {(inputs: Error_Invalid_Target_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se puede asignar a este usuario.`)
};

const en_xa2_error_invalid_target_user = /** @type {(inputs: Error_Invalid_Target_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cànnòt àssìgn tò thìs ùsèr. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Cannot assign to this user." |
*
* @param {Error_Invalid_Target_UserInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_invalid_target_user = /** @type {((inputs?: Error_Invalid_Target_UserInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_Target_UserInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_invalid_target_user(inputs)
	if (locale === "en-XA") return en_xa2_error_invalid_target_user(inputs)
	return en_error_invalid_target_user(inputs)
});