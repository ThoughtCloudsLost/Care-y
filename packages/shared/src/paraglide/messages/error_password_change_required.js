/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Password_Change_RequiredInputs */

const en_error_password_change_required = /** @type {(inputs: Error_Password_Change_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose your own password to continue.`)
};

const es_error_password_change_required = /** @type {(inputs: Error_Password_Change_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige tu propia contraseña para continuar.`)
};

const en_xa2_error_password_change_required = /** @type {(inputs: Error_Password_Change_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè yòùr òwn pàsswòrd tò còntìnùè. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose your own password to continue." |
*
* @param {Error_Password_Change_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_password_change_required = /** @type {((inputs?: Error_Password_Change_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Password_Change_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_password_change_required(inputs)
	if (locale === "en-XA") return en_xa2_error_password_change_required(inputs)
	return en_error_password_change_required(inputs)
});