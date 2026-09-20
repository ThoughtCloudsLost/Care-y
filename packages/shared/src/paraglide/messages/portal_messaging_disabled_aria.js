/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Messaging_Disabled_AriaInputs */

const en_portal_messaging_disabled_aria = /** @type {(inputs: Portal_Messaging_Disabled_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization has disabled messaging on this channel. You cannot send messages at this time.`)
};

const es_portal_messaging_disabled_aria = /** @type {(inputs: Portal_Messaging_Disabled_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La organización ha desactivado la mensajería en este canal. No puedes enviar mensajes en este momento.`)
};

const en_xa2_portal_messaging_disabled_aria = /** @type {(inputs: Portal_Messaging_Disabled_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn hàs dìsàblèd mèssàgìng òn thìs chànnèl. Yòù cànnòt sènd mèssàgès àt thìs tìmè. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization has disabled messaging on this channel. You cannot send messages at this time." |
*
* @param {Portal_Messaging_Disabled_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_messaging_disabled_aria = /** @type {((inputs?: Portal_Messaging_Disabled_AriaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Messaging_Disabled_AriaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_messaging_disabled_aria(inputs)
	if (locale === "en-XA") return en_xa2_portal_messaging_disabled_aria(inputs)
	return en_portal_messaging_disabled_aria(inputs)
});