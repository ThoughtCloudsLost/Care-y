/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Fs_Drawer_OpenInputs */

const en_demo_fs_drawer_open = /** @type {(inputs: Demo_Fs_Drawer_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open handbook`)
};

const es_demo_fs_drawer_open = /** @type {(inputs: Demo_Fs_Drawer_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir el manual`)
};

/**
* | output |
* | --- |
* | "Open handbook" |
*
* @param {Demo_Fs_Drawer_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_open = /** @type {((inputs?: Demo_Fs_Drawer_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Drawer_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_fs_drawer_open(inputs)
	return es_demo_fs_drawer_open(inputs)
});