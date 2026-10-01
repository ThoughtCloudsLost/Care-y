/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Adjustment_HintInputs */

const en_admin_funds_adjustment_hint = /** @type {(inputs: Admin_Funds_Adjustment_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add money collected outside the app, such as a website donation, or take money out to correct a balance.`)
};

const es_admin_funds_adjustment_hint = /** @type {(inputs: Admin_Funds_Adjustment_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Añade dinero recibido fuera de la app, como una donación por la web, o retira dinero para corregir un saldo.`)
};

const en_xa2_admin_funds_adjustment_hint = /** @type {(inputs: Admin_Funds_Adjustment_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd mònèy còllèctèd òùtsìdè thè àpp, sùch às à wèbsìtè dònàtìòn, òr tàkè mònèy òùt tò còrrèct à bàlàncè. ••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add money collected outside the app, such as a website donation, or take money out to correct a balance." |
*
* @param {Admin_Funds_Adjustment_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_adjustment_hint = /** @type {((inputs?: Admin_Funds_Adjustment_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Adjustment_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_adjustment_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_adjustment_hint(inputs)
	return en_admin_funds_adjustment_hint(inputs)
});