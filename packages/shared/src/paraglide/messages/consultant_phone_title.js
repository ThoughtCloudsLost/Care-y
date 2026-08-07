/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_TitleInputs */

const en_consultant_phone_title = /** @type {(inputs: Consultant_Phone_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My phone`)
};

const es_consultant_phone_title = /** @type {(inputs: Consultant_Phone_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mi telefono`)
};

/**
* | output |
* | --- |
* | "My phone" |
*
* @param {Consultant_Phone_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_title = /** @type {((inputs?: Consultant_Phone_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_title(inputs)
	return es_consultant_phone_title(inputs)
});