/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_HintInputs */

const en_share_view_hint = /** @type {(inputs: Share_View_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The link you opened carried the key that unlocked this message on your device. The server cannot read it. Because the key travels in the link, the link only works once.`)
};

const es_share_view_hint = /** @type {(inputs: Share_View_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El enlace que abriste llevaba la clave que desbloqueó este mensaje en tu dispositivo. El servidor no puede leerlo. Como la clave viaja en el enlace, el enlace solo funciona una vez.`)
};

const en_xa2_share_view_hint = /** @type {(inputs: Share_View_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè lìnk yòù òpènèd càrrìèd thè kèy thàt ùnlòckèd thìs mèssàgè òn yòùr dèvìcè. Thè sèrvèr cànnòt rèàd ìt. Bècàùsè thè kèy tràvèls ìn thè lìnk, thè lìnk ònly wòrks òncè. •••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The link you opened carried the key that unlocked this message on your device. The server cannot read it. Because the key travels in the link, the link only ..." |
*
* @param {Share_View_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_hint = /** @type {((inputs?: Share_View_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_hint(inputs)
	if (locale === "en-XA") return en_xa2_share_view_hint(inputs)
	return en_share_view_hint(inputs)
});