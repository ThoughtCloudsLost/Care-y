/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Fs_Handbook_ToggleInputs */

const en_demo_fs_handbook_toggle = /** @type {(inputs: Demo_Fs_Handbook_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handbook`)
};

const es_demo_fs_handbook_toggle = /** @type {(inputs: Demo_Fs_Handbook_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manual`)
};

const en_xa2_demo_fs_handbook_toggle = /** @type {(inputs: Demo_Fs_Handbook_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hàndbòòk •••⟧`)
};

/**
* | output |
* | --- |
* | "Handbook" |
*
* @param {Demo_Fs_Handbook_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_fs_handbook_toggle = /** @type {((inputs?: Demo_Fs_Handbook_ToggleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Handbook_ToggleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_fs_handbook_toggle(inputs)
	if (locale === "en-XA") return en_xa2_demo_fs_handbook_toggle(inputs)
	return en_demo_fs_handbook_toggle(inputs)
});