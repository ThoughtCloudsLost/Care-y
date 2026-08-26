/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Fs_Drawer_ResizeInputs */

const en_demo_fs_drawer_resize = /** @type {(inputs: Demo_Fs_Drawer_ResizeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resize handbook panel`)
};

const es_demo_fs_drawer_resize = /** @type {(inputs: Demo_Fs_Drawer_ResizeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar el ancho del panel del manual`)
};

/**
* | output |
* | --- |
* | "Resize handbook panel" |
*
* @param {Demo_Fs_Drawer_ResizeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_resize = /** @type {((inputs?: Demo_Fs_Drawer_ResizeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Drawer_ResizeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_fs_drawer_resize(inputs)
	return es_demo_fs_drawer_resize(inputs)
});