/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_TitleInputs */

const en_consultant_phone_title = /** @type {(inputs: Consultant_Phone_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My phone`)
};

const es_consultant_phone_title = /** @type {(inputs: Consultant_Phone_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mi teléfono`)
};

const en_xa2_consultant_phone_title = /** @type {(inputs: Consultant_Phone_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦My phònè •••⟧`)
};

/**
* | output |
* | --- |
* | "My phone" |
*
* @param {Consultant_Phone_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_title = /** @type {((inputs?: Consultant_Phone_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_title(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_title(inputs)
	return en_consultant_phone_title(inputs)
});