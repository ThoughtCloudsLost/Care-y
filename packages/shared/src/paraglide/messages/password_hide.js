/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Password_HideInputs */

const en_password_hide = /** @type {(inputs: Password_HideInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hide password`)
};

const es_password_hide = /** @type {(inputs: Password_HideInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocultar contraseña`)
};

/**
* | output |
* | --- |
* | "Hide password" |
*
* @param {Password_HideInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_hide = /** @type {((inputs?: Password_HideInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_HideInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_hide(inputs)
	return es_password_hide(inputs)
});