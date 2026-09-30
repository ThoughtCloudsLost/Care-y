/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Modes_BodyInputs */

const en_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch between the read-only handbook and the interactive simulator app from the top bar. Read shows the handbook as a document. The simulator is hidden but keeps running. Simulate places the simulator beside the text on wide screens. Fullscreen activates on narrow screens and whenever the simulator fills the window. In fullscreen the handbook moves into a resizable drawer, opened and repositioned from a book icon tab on the edge.`)
};

const es_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambia entre el manual de solo lectura y el simulador interactivo de la aplicación desde la barra superior. Lectura muestra el manual como un documento. El simulador queda oculto, pero sigue funcionando. Simular coloca el simulador junto al texto en pantallas anchas. La pantalla completa se activa en pantallas estrechas y cuando el simulador ocupa toda la ventana. En pantalla completa, el manual pasa a un cajón redimensionable que se abre y se reubica desde una pestaña con un icono de libro en el borde.`)
};

const en_xa2_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtch bètwèèn thè rèàd-ònly hàndbòòk ànd thè ìntèràctìvè sìmùlàtòr àpp fròm thè tòp bàr. Rèàd shòws thè hàndbòòk às à dòcùmènt. Thè sìmùlàtòr ìs hìddèn bùt kèèps rùnnìng. Sìmùlàtè plàcès thè sìmùlàtòr bèsìdè thè tèxt òn wìdè scrèèns. Fùllscrèèn àctìvàtès òn nàrròw scrèèns ànd whènèvèr thè sìmùlàtòr fìlls thè wìndòw. Ìn fùllscrèèn thè hàndbòòk mòvès ìntò à rèsìzàblè dràwèr, òpènèd ànd rèpòsìtìònèd fròm à bòòk ìcòn tàb òn thè èdgè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Switch between the read-only handbook and the interactive simulator app from the top bar. Read shows the handbook as a document. The simulator is hidden but ..." |
*
* @param {Demo_Entry_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_modes_body = /** @type {((inputs?: Demo_Entry_Modes_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Modes_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_modes_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_entry_modes_body(inputs)
	return en_demo_entry_modes_body(inputs)
});