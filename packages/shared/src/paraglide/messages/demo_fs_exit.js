/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Fs_ExitInputs */

const en_demo_fs_exit = /** @type {(inputs: Demo_Fs_ExitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exit full screen`)
};

const es_demo_fs_exit = /** @type {(inputs: Demo_Fs_ExitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salir de pantalla completa`)
};

const en_xa2_demo_fs_exit = /** @type {(inputs: Demo_Fs_ExitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxìt fùll scrèèn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Exit full screen" |
*
* @param {Demo_Fs_ExitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_fs_exit = /** @type {((inputs?: Demo_Fs_ExitInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_ExitInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_fs_exit(inputs)
	if (locale === "en-XA") return en_xa2_demo_fs_exit(inputs)
	return en_demo_fs_exit(inputs)
});