/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_FundsInputs */

const en_panel_funds = /** @type {(inputs: Panel_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funds`)
};

const es_panel_funds = /** @type {(inputs: Panel_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondos`)
};

const en_xa2_panel_funds = /** @type {(inputs: Panel_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnds ••⟧`)
};

/**
* | output |
* | --- |
* | "Funds" |
*
* @param {Panel_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_funds = /** @type {((inputs?: Panel_FundsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_FundsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_funds(inputs)
	if (locale === "en-XA") return en_xa2_panel_funds(inputs)
	return en_panel_funds(inputs)
});