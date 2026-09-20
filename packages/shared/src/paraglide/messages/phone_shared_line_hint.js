/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Phone_Shared_Line_HintInputs */

const en_phone_shared_line_hint = /** @type {(inputs: Phone_Shared_Line_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Many people use this number, like a shelter or clinic phone. Shared numbers are not used to suggest duplicates.`)
};

const es_phone_shared_line_hint = /** @type {(inputs: Phone_Shared_Line_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Muchas personas usan este número, como el teléfono de un albergue o una clínica. Los números compartidos no se usan para sugerir duplicados.`)
};

const en_xa2_phone_shared_line_hint = /** @type {(inputs: Phone_Shared_Line_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màny pèòplè ùsè thìs nùmbèr, lìkè à shèltèr òr clìnìc phònè. Shàrèd nùmbèrs àrè nòt ùsèd tò sùggèst dùplìcàtès. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Many people use this number, like a shelter or clinic phone. Shared numbers are not used to suggest duplicates." |
*
* @param {Phone_Shared_Line_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const phone_shared_line_hint = /** @type {((inputs?: Phone_Shared_Line_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Phone_Shared_Line_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_phone_shared_line_hint(inputs)
	if (locale === "en-XA") return en_xa2_phone_shared_line_hint(inputs)
	return en_phone_shared_line_hint(inputs)
});