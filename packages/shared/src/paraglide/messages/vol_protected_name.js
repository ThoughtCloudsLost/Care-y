/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Protected_NameInputs */

const en_vol_protected_name = /** @type {(inputs: Vol_Protected_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your real name is end-to-end encrypted. Only your team can read it.`)
};

const es_vol_protected_name = /** @type {(inputs: Vol_Protected_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu nombre real tiene cifrado de extremo a extremo. Solo tu equipo puede leerlo.`)
};

const en_xa2_vol_protected_name = /** @type {(inputs: Vol_Protected_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr rèàl nàmè ìs ènd-tò-ènd èncryptèd. Ònly yòùr tèàm càn rèàd ìt. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your real name is end-to-end encrypted. Only your team can read it." |
*
* @param {Vol_Protected_NameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_protected_name = /** @type {((inputs?: Vol_Protected_NameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Protected_NameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_protected_name(inputs)
	if (locale === "en-XA") return en_xa2_vol_protected_name(inputs)
	return en_vol_protected_name(inputs)
});