/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Fs_Drawer_CloseInputs */

const en_demo_fs_drawer_close = /** @type {(inputs: Demo_Fs_Drawer_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close handbook`)
};

const es_demo_fs_drawer_close = /** @type {(inputs: Demo_Fs_Drawer_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar el manual`)
};

/**
* | output |
* | --- |
* | "Close handbook" |
*
* @param {Demo_Fs_Drawer_CloseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_close = /** @type {((inputs?: Demo_Fs_Drawer_CloseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Drawer_CloseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_fs_drawer_close(inputs)
	return es_demo_fs_drawer_close(inputs)
});