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

const en_xa2_demo_fs_drawer_open = /** @type {(inputs: Demo_Fs_Drawer_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn hàndbòòk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Open handbook" |
*
* @param {Demo_Fs_Drawer_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_open = /** @type {((inputs?: Demo_Fs_Drawer_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Drawer_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_fs_drawer_open(inputs)
	if (locale === "en-XA") return en_xa2_demo_fs_drawer_open(inputs)
	return en_demo_fs_drawer_open(inputs)
});