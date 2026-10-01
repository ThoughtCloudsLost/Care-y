/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Fund_Ledger_SubtitleInputs */

const en_hub_fund_ledger_subtitle = /** @type {(inputs: Hub_Fund_Ledger_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Balances and every recorded entry`)
};

const es_hub_fund_ledger_subtitle = /** @type {(inputs: Hub_Fund_Ledger_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saldos y todos los movimientos registrados`)
};

const en_xa2_hub_fund_ledger_subtitle = /** @type {(inputs: Hub_Fund_Ledger_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàlàncès ànd èvèry rècòrdèd èntry ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Balances and every recorded entry" |
*
* @param {Hub_Fund_Ledger_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_fund_ledger_subtitle = /** @type {((inputs?: Hub_Fund_Ledger_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Fund_Ledger_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_fund_ledger_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_fund_ledger_subtitle(inputs)
	return en_hub_fund_ledger_subtitle(inputs)
});