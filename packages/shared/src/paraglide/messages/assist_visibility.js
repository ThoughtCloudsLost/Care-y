/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Assist_VisibilityInputs */

const en_assist_visibility = /** @type {(inputs: Assist_VisibilityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The amount counts toward the fund balance the whole team sees. The note, and the fact that this ${i?.ticket} received it, stay with the ${i?.ticket}.`)
};

const es_assist_visibility = /** @type {(inputs: Assist_VisibilityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El importe cuenta en el saldo del fondo que ve todo el equipo. La nota, y el hecho de que este ${i?.ticket} lo recibió, quedan en el ${i?.ticket}.`)
};

const en_xa2_assist_visibility = /** @type {(inputs: Assist_VisibilityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thè àmòùnt còùnts tòwàrd thè fùnd bàlàncè thè whòlè tèàm sèès. Thè nòtè, ànd thè fàct thàt thìs  •••••••••••••••••••••••••••••${i?.ticket} rècèìvèd ìt, stày wìth thè  •••••••••${i?.ticket}. •⟧`)
};

/**
* | output |
* | --- |
* | "The amount counts toward the fund balance the whole team sees. The note, and the fact that this {ticket} received it, stay with the {ticket}." |
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