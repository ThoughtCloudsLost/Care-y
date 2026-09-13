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

/**
* | output |
* | --- |
* | "This link is no longer active. If you need help, contact your support team for a new one." |
*
* @param {Portal_Dead_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_dead_link = /** @type {((inputs?: Portal_Dead_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Dead_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_dead_link(inputs)
	return es_portal_dead_link(inputs)
});