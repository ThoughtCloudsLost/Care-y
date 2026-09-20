/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Cannot_Remove_Last_2faInputs */

const en_error_cannot_remove_last_2fa = /** @type {(inputs: Error_Cannot_Remove_Last_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cannot remove your last verification method. At least one must remain active.`)
};

const es_error_cannot_remove_last_2fa = /** @type {(inputs: Error_Cannot_Remove_Last_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No puedes eliminar tu último método de verificación. Al menos uno debe permanecer activo.`)
};

const en_xa2_error_cannot_remove_last_2fa = /** @type {(inputs: Error_Cannot_Remove_Last_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cànnòt rèmòvè yòùr làst vèrìfìcàtìòn mèthòd. Àt lèàst ònè mùst rèmàìn àctìvè. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Cannot remove your last verification method. At least one must remain active." |
*
* @param {Error_Cannot_Remove_Last_2faInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_remove_last_2fa = /** @type {((inputs?: Error_Cannot_Remove_Last_2faInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Remove_Last_2faInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_cannot_remove_last_2fa(inputs)
	if (locale === "en-XA") return en_xa2_error_cannot_remove_last_2fa(inputs)
	return en_error_cannot_remove_last_2fa(inputs)
});