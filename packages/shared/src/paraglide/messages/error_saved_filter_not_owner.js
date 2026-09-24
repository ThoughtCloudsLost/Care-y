/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Saved_Filter_Not_OwnerInputs */

const en_error_saved_filter_not_owner = /** @type {(inputs: Error_Saved_Filter_Not_OwnerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only the person who shared a filter can change it.`)
};

const es_error_saved_filter_not_owner = /** @type {(inputs: Error_Saved_Filter_Not_OwnerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo la persona que compartió un filtro puede modificarlo.`)
};

const en_xa2_error_saved_filter_not_owner = /** @type {(inputs: Error_Saved_Filter_Not_OwnerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònly thè pèrsòn whò shàrèd à fìltèr càn chàngè ìt. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Only the person who shared a filter can change it." |
*
* @param {Error_Saved_Filter_Not_OwnerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_saved_filter_not_owner = /** @type {((inputs?: Error_Saved_Filter_Not_OwnerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Saved_Filter_Not_OwnerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_saved_filter_not_owner(inputs)
	if (locale === "en-XA") return en_xa2_error_saved_filter_not_owner(inputs)
	return en_error_saved_filter_not_owner(inputs)
});