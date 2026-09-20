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

const en_xa2_demo_fs_drawer_close = /** @type {(inputs: Demo_Fs_Drawer_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè hàndbòòk •••••⟧`)
};

/**
* | output |
* | --- |
* | "Close handbook" |
*
* @param {Demo_Fs_Drawer_CloseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_close = /** @type {((inputs?: Demo_Fs_Drawer_CloseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Drawer_CloseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_fs_drawer_close(inputs)
	if (locale === "en-XA") return en_xa2_demo_fs_drawer_close(inputs)
	return en_demo_fs_drawer_close(inputs)
});