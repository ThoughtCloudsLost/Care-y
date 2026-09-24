/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} View_Switcher_TableInputs */

const en_view_switcher_table = /** @type {(inputs: View_Switcher_TableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Table`)
};

const es_view_switcher_table = /** @type {(inputs: View_Switcher_TableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tabla`)
};

const en_xa2_view_switcher_table = /** @type {(inputs: View_Switcher_TableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàblè ••⟧`)
};

/**
* | output |
* | --- |
* | "Table" |
*
* @param {View_Switcher_TableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_table = /** @type {((inputs?: View_Switcher_TableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_TableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_view_switcher_table(inputs)
	if (locale === "en-XA") return en_xa2_view_switcher_table(inputs)
	return en_view_switcher_table(inputs)
});