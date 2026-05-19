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

/**
* | output |
* | --- |
* | "Show password" |
*
* @param {Password_ShowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_show = /** @type {((inputs?: Password_ShowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Password_ShowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_password_show(inputs)
	return es_password_show(inputs)
});