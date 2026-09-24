/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} View_Switcher_GridInputs */

const en_view_switcher_grid = /** @type {(inputs: View_Switcher_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Grid`)
};

const es_view_switcher_grid = /** @type {(inputs: View_Switcher_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuadrícula`)
};

const en_xa2_view_switcher_grid = /** @type {(inputs: View_Switcher_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grìd ••⟧`)
};

/**
* | output |
* | --- |
* | "Grid" |
*
* @param {View_Switcher_GridInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_grid = /** @type {((inputs?: View_Switcher_GridInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_GridInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_view_switcher_grid(inputs)
	if (locale === "en-XA") return en_xa2_view_switcher_grid(inputs)
	return en_view_switcher_grid(inputs)
});