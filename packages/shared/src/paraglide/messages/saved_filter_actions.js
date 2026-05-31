/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_ActionsInputs */

const en_saved_filter_actions = /** @type {(inputs: Saved_Filter_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter actions`)
};

const es_saved_filter_actions = /** @type {(inputs: Saved_Filter_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acciones de filtro`)
};

/**
* | output |
* | --- |
* | "Filter actions" |
*
* @param {Saved_Filter_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_actions = /** @type {((inputs?: Saved_Filter_ActionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_ActionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_actions(inputs)
	return es_saved_filter_actions(inputs)
});