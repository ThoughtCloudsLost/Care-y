/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ fund: NonNullable<unknown>, amount: NonNullable<unknown> }} Assist_Below_ZeroInputs */

const en_assist_below_zero = /** @type {(inputs: Assist_Below_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This takes ${i?.fund} to ${i?.amount}, below zero. You can still record it.`)
};

const es_assist_below_zero = /** @type {(inputs: Assist_Below_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esto deja el fondo ${i?.fund} en ${i?.amount}, por debajo de cero. Puedes registrarlo igualmente.`)
};

const en_xa2_assist_below_zero = /** @type {(inputs: Assist_Below_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs tàkès  ••••${i?.fund} tò  ••${i?.amount}, bèlòw zèrò. Yòù càn stìll rècòrd ìt. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This takes {fund} to {amount}, below zero. You can still record it." |
*
* @param {Assist_Below_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_below_zero = /** @type {((inputs: Assist_Below_ZeroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_Below_ZeroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_below_zero(inputs)
	if (locale === "en-XA") return en_xa2_assist_below_zero(inputs)
	return en_assist_below_zero(inputs)
});