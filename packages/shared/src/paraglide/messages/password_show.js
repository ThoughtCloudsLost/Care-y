/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Password_ShowInputs */

const en_password_show = /** @type {(inputs: Password_ShowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show password`)
};

const es_password_show = /** @type {(inputs: Password_ShowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrar contraseña`)
};

const en_xa2_password_show = /** @type {(inputs: Password_ShowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòw pàsswòrd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Show password" |
*
* @param {Password_ShowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const password_show = /** @type {((inputs?: Password_ShowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_ShowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_password_show(inputs)
	if (locale === "en-XA") return en_xa2_password_show(inputs)
	return en_password_show(inputs)
});