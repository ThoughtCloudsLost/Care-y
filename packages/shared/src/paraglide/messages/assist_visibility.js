/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Assist_VisibilityInputs */

const en_assist_visibility = /** @type {(inputs: Assist_VisibilityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The amount counts toward the fund balance the whole team sees. The note stays with the ${i?.ticket}. Fund auditors can open this ${i?.ticket} from the fund's history.`)
};

const es_assist_visibility = /** @type {(inputs: Assist_VisibilityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El importe cuenta en el saldo del fondo que ve todo el equipo. La nota queda en el ${i?.ticket}. Quienes auditan los fondos pueden abrir este ${i?.ticket} desde el historial del fondo.`)
};

const en_xa2_assist_visibility = /** @type {(inputs: Assist_VisibilityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thè àmòùnt còùnts tòwàrd thè fùnd bàlàncè thè whòlè tèàm sèès. Thè nòtè stàys wìth thè  •••••••••••••••••••••••••••${i?.ticket}. Fùnd àùdìtòrs càn òpèn thìs  •••••••••${i?.ticket} fròm thè fùnd's hìstòry. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The amount counts toward the fund balance the whole team sees. The note stays with the {ticket}. Fund auditors can open this {ticket} from the fund's history." |
*
* @param {Assist_VisibilityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_visibility = /** @type {((inputs: Assist_VisibilityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_VisibilityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_visibility(inputs)
	if (locale === "en-XA") return en_xa2_assist_visibility(inputs)
	return en_assist_visibility(inputs)
});