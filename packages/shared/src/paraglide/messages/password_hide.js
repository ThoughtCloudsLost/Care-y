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

const en_xa2_password_hide = /** @type {(inputs: Password_HideInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìdè pàsswòrd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Hide password" |
*
* @param {Password_HideInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const password_hide = /** @type {((inputs?: Password_HideInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_HideInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_password_hide(inputs)
	if (locale === "en-XA") return en_xa2_password_hide(inputs)
	return en_password_hide(inputs)
});