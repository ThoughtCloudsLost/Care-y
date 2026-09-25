/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Controls_BodyInputs */

const en_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the app simulator is open, a toolbar above the simulator lets you enter fullscreen mode, resize to phone or desktop presets, and switch the logged in user's role. The toolbar is also a drag handle, so you can grab it anywhere to reposition the simulator, and you can resize from any edge or corner by dragging.`)
};

const es_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando el simulador de la aplicación está abierto, una barra oscura sobre el simulador permite entrar en pantalla completa, cambiar el tamaño con preajustes de teléfono o escritorio y cambiar el rol del usuario conectado. La barra también sirve como asa de arrastre, así que puedes agarrarla en cualquier punto para reposicionar el simulador, y puedes cambiar el tamaño desde cualquier borde o esquina arrastrando.`)
};

const en_xa2_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn thè àpp sìmùlàtòr ìs òpèn, à tòòlbàr àbòvè thè sìmùlàtòr lèts yòù èntèr fùllscrèèn mòdè, rèsìzè tò phònè òr dèsktòp prèsèts, ànd swìtch thè lòggèd ìn ùsèr's ròlè. Thè tòòlbàr ìs àlsò à dràg hàndlè, sò yòù càn gràb ìt ànywhèrè tò rèpòsìtìòn thè sìmùlàtòr, ànd yòù càn rèsìzè fròm àny èdgè òr còrnèr by dràggìng. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When the app simulator is open, a toolbar above the simulator lets you enter fullscreen mode, resize to phone or desktop presets, and switch the logged in us..." |
*
* @param {Demo_Entry_Controls_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_controls_body = /** @type {((inputs?: Demo_Entry_Controls_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Controls_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_controls_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_entry_controls_body(inputs)
	return en_demo_entry_controls_body(inputs)
});