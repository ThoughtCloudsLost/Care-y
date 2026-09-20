/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Shell_LoadingInputs */

const en_shell_loading = /** @type {(inputs: Shell_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading`)
};

const es_shell_loading = /** @type {(inputs: Shell_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando`)
};

const en_xa2_shell_loading = /** @type {(inputs: Shell_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Loading" |
*
* @param {Shell_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const shell_loading = /** @type {((inputs?: Shell_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Shell_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_shell_loading(inputs)
	if (locale === "en-XA") return en_xa2_shell_loading(inputs)
	return en_shell_loading(inputs)
});