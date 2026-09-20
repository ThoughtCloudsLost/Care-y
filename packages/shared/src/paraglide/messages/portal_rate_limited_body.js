/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Rate_Limited_BodyInputs */

const en_portal_rate_limited_body = /** @type {(inputs: Portal_Rate_Limited_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your link still works. Too many pages loaded in a short time, so loading is paused for a moment. This page will try again on its own; you can leave it open.`)
};

const es_portal_rate_limited_body = /** @type {(inputs: Portal_Rate_Limited_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu enlace sigue funcionando. Se cargaron demasiadas páginas en poco tiempo, así que la carga está en pausa por un momento. Esta página lo intentará de nuevo por sí sola; puedes dejarla abierta.`)
};

const en_xa2_portal_rate_limited_body = /** @type {(inputs: Portal_Rate_Limited_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr lìnk stìll wòrks. Tòò màny pàgès lòàdèd ìn à shòrt tìmè, sò lòàdìng ìs pàùsèd fòr à mòmènt. Thìs pàgè wìll try àgàìn òn ìts òwn; yòù càn lèàvè ìt òpèn. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your link still works. Too many pages loaded in a short time, so loading is paused for a moment. This page will try again on its own; you can leave it open." |
*
* @param {Portal_Rate_Limited_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_rate_limited_body = /** @type {((inputs?: Portal_Rate_Limited_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Rate_Limited_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_rate_limited_body(inputs)
	if (locale === "en-XA") return en_xa2_portal_rate_limited_body(inputs)
	return en_portal_rate_limited_body(inputs)
});