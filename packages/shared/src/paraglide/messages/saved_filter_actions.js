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

const en_xa2_saved_filter_actions = /** @type {(inputs: Saved_Filter_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr àctìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "Filter actions" |
*
* @param {Saved_Filter_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_actions = /** @type {((inputs?: Saved_Filter_ActionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_ActionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_actions(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_actions(inputs)
	return en_saved_filter_actions(inputs)
});