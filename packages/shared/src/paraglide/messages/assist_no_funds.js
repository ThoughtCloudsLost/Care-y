/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_No_FundsInputs */

const en_assist_no_funds = /** @type {(inputs: Assist_No_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No funds are set up yet.`)
};

const es_assist_no_funds = /** @type {(inputs: Assist_No_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todavía no hay fondos configurados.`)
};

const en_xa2_assist_no_funds = /** @type {(inputs: Assist_No_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò fùnds àrè sèt ùp yèt. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No funds are set up yet." |
*
* @param {Assist_No_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_no_funds = /** @type {((inputs?: Assist_No_FundsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_No_FundsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_no_funds(inputs)
	if (locale === "en-XA") return en_xa2_assist_no_funds(inputs)
	return en_assist_no_funds(inputs)
});