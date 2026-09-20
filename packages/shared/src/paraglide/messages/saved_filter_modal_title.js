/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Modal_TitleInputs */

const en_saved_filter_modal_title = /** @type {(inputs: Saved_Filter_Modal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save Filter`)
};

const es_saved_filter_modal_title = /** @type {(inputs: Saved_Filter_Modal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar filtro`)
};

const en_xa2_saved_filter_modal_title = /** @type {(inputs: Saved_Filter_Modal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè Fìltèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Save Filter" |
*
* @param {Saved_Filter_Modal_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_modal_title = /** @type {((inputs?: Saved_Filter_Modal_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Modal_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_modal_title(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_modal_title(inputs)
	return en_saved_filter_modal_title(inputs)
});