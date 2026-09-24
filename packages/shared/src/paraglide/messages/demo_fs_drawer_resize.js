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

const en_xa2_demo_fs_drawer_resize = /** @type {(inputs: Demo_Fs_Drawer_ResizeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsìzè hàndbòòk pànèl •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Resize handbook panel" |
*
* @param {Demo_Fs_Drawer_ResizeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_resize = /** @type {((inputs?: Demo_Fs_Drawer_ResizeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Drawer_ResizeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_fs_drawer_resize(inputs)
	if (locale === "en-XA") return en_xa2_demo_fs_drawer_resize(inputs)
	return en_demo_fs_drawer_resize(inputs)
});