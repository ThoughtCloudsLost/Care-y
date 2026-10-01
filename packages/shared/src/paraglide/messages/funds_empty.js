/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Funds_EmptyInputs */

const en_funds_empty = /** @type {(inputs: Funds_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No funds yet.`)
};

const es_funds_empty = /** @type {(inputs: Funds_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todavía no hay fondos.`)
};

const en_xa2_funds_empty = /** @type {(inputs: Funds_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò fùnds yèt. ••••⟧`)
};

/**
* | output |
* | --- |
* | "No funds yet." |
*
* @param {Funds_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const funds_empty = /** @type {((inputs?: Funds_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Funds_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_funds_empty(inputs)
	if (locale === "en-XA") return en_xa2_funds_empty(inputs)
	return en_funds_empty(inputs)
});