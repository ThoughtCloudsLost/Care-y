/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_Bad_LinkInputs */

const en_share_view_bad_link = /** @type {(inputs: Share_View_Bad_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Check that you opened the complete link from your message.`)
};

const es_share_view_bad_link = /** @type {(inputs: Share_View_Bad_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifica que abriste el enlace completo desde tu mensaje.`)
};

const en_xa2_share_view_bad_link = /** @type {(inputs: Share_View_Bad_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèck thàt yòù òpènèd thè còmplètè lìnk fròm yòùr mèssàgè. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Check that you opened the complete link from your message." |
*
* @param {Share_View_Bad_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_bad_link = /** @type {((inputs?: Share_View_Bad_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Bad_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_bad_link(inputs)
	if (locale === "en-XA") return en_xa2_share_view_bad_link(inputs)
	return en_share_view_bad_link(inputs)
});