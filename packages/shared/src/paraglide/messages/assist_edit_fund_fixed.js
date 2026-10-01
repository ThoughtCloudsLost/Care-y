/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_Edit_Fund_FixedInputs */

const en_assist_edit_fund_fixed = /** @type {(inputs: Assist_Edit_Fund_FixedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A correction stays in the same fund.`)
};

const es_assist_edit_fund_fixed = /** @type {(inputs: Assist_Edit_Fund_FixedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una corrección se queda en el mismo fondo.`)
};

const en_xa2_assist_edit_fund_fixed = /** @type {(inputs: Assist_Edit_Fund_FixedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À còrrèctìòn stàys ìn thè sàmè fùnd. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A correction stays in the same fund." |
*
* @param {Assist_Edit_Fund_FixedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_edit_fund_fixed = /** @type {((inputs?: Assist_Edit_Fund_FixedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_Edit_Fund_FixedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_edit_fund_fixed(inputs)
	if (locale === "en-XA") return en_xa2_assist_edit_fund_fixed(inputs)
	return en_assist_edit_fund_fixed(inputs)
});