/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} View_Switcher_RowsInputs */

const en_view_switcher_rows = /** @type {(inputs: View_Switcher_RowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compact rows`)
};

const es_view_switcher_rows = /** @type {(inputs: View_Switcher_RowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filas compactas`)
};

/**
* | output |
* | --- |
* | "Compact rows" |
*
* @param {View_Switcher_RowsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_rows = /** @type {((inputs?: View_Switcher_RowsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_RowsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_view_switcher_rows(inputs)
	return es_view_switcher_rows(inputs)
});