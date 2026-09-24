/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_ResizeInputs */

const en_demo_flow_resize = /** @type {(inputs: Demo_Flow_ResizeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resize the data flow panel. Use the arrow keys to change its height.`)
};

const es_demo_flow_resize = /** @type {(inputs: Demo_Flow_ResizeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar la altura del panel de flujo de datos. Usa las flechas del teclado.`)
};

const en_xa2_demo_flow_resize = /** @type {(inputs: Demo_Flow_ResizeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsìzè thè dàtà flòw pànèl. Ùsè thè àrròw kèys tò chàngè ìts hèìght. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Resize the data flow panel. Use the arrow keys to change its height." |
*
* @param {Demo_Flow_ResizeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_resize = /** @type {((inputs?: Demo_Flow_ResizeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_ResizeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_resize(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_resize(inputs)
	return en_demo_flow_resize(inputs)
});