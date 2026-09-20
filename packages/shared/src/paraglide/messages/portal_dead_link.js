/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Dead_LinkInputs */

const en_portal_dead_link = /** @type {(inputs: Portal_Dead_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link is no longer active. If you need help, contact your support team for a new one.`)
};

const es_portal_dead_link = /** @type {(inputs: Portal_Dead_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace ya no está activo. Si necesitas ayuda, contacta a tu equipo de apoyo para obtener uno nuevo.`)
};

const en_xa2_portal_dead_link = /** @type {(inputs: Portal_Dead_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk ìs nò lòngèr àctìvè. Ìf yòù nèèd hèlp, còntàct yòùr sùppòrt tèàm fòr à nèw ònè. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link is no longer active. If you need help, contact your support team for a new one." |
*
* @param {Portal_Dead_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_dead_link = /** @type {((inputs?: Portal_Dead_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Dead_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_dead_link(inputs)
	if (locale === "en-XA") return en_xa2_portal_dead_link(inputs)
	return en_portal_dead_link(inputs)
});