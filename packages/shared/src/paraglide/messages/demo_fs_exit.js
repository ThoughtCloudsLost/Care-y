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

/**
* | output |
* | --- |
* | "Exit full screen" |
*
* @param {Demo_Fs_ExitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_exit = /** @type {((inputs?: Demo_Fs_ExitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_ExitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_fs_exit(inputs)
	return es_demo_fs_exit(inputs)
});