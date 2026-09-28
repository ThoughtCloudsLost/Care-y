/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Stale_Key_WrapsInputs */

const en_error_stale_key_wraps = /** @type {(inputs: Error_Stale_Key_WrapsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your access changed while your password was being changed. Try again.`)
};

const es_error_stale_key_wraps = /** @type {(inputs: Error_Stale_Key_WrapsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu acceso cambió mientras se cambiaba tu contraseña. Inténtalo de nuevo.`)
};

const en_xa2_error_stale_key_wraps = /** @type {(inputs: Error_Stale_Key_WrapsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr àccèss chàngèd whìlè yòùr pàsswòrd wàs bèìng chàngèd. Try àgàìn. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your access changed while your password was being changed. Try again." |
*
* @param {Error_Stale_Key_WrapsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_stale_key_wraps = /** @type {((inputs?: Error_Stale_Key_WrapsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Stale_Key_WrapsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_stale_key_wraps(inputs)
	if (locale === "en-XA") return en_xa2_error_stale_key_wraps(inputs)
	return en_error_stale_key_wraps(inputs)
});