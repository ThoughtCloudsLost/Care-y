/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Paste_HintInputs */

const en_portal_passphrase_paste_hint = /** @type {(inputs: Portal_Passphrase_Paste_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Paste is allowed. Pick something you can remember.`)
};

const es_portal_passphrase_paste_hint = /** @type {(inputs: Portal_Passphrase_Paste_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se permite pegar. Elige algo que puedas recordar.`)
};

const en_xa2_portal_passphrase_paste_hint = /** @type {(inputs: Portal_Passphrase_Paste_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàstè ìs àllòwèd. Pìck sòmèthìng yòù càn rèmèmbèr. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Paste is allowed. Pick something you can remember." |
*
* @param {Portal_Passphrase_Paste_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_paste_hint = /** @type {((inputs?: Portal_Passphrase_Paste_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Paste_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_paste_hint(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_paste_hint(inputs)
	return en_portal_passphrase_paste_hint(inputs)
});