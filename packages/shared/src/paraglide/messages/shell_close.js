/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Shell_CloseInputs */

const en_shell_close = /** @type {(inputs: Shell_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close`)
};

const es_shell_close = /** @type {(inputs: Shell_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar`)
};

const en_xa2_shell_close = /** @type {(inputs: Shell_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè ••⟧`)
};

/**
* | output |
* | --- |
* | "Close" |
*
* @param {Shell_CloseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const shell_close = /** @type {((inputs?: Shell_CloseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Shell_CloseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_shell_close(inputs)
	if (locale === "en-XA") return en_xa2_shell_close(inputs)
	return en_shell_close(inputs)
});