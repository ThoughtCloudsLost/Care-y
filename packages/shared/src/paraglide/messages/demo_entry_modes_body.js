/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Modes_BodyInputs */

const en_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Read and Simulate are toggled from the top bar. Read mode shows the handbook as a document with the simulator hidden but still running. Simulate mode shows the phone frame alongside the text on wide screens, and on narrow screens or when the frame fills the window it activates fullscreen, where the simulator fills the screen and the handbook moves into a resizable drawer with a book icon tab on the edge to open and reposition it.`)
};

const es_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lectura y Simulación se alternan desde la barra superior. El modo lectura muestra el manual como un documento con el simulador oculto pero activo, y se puede mantener pulsada cualquier captura de pantalla para ver la aplicación en vivo. El modo simulación muestra el marco del teléfono junto al texto en pantallas anchas, y en pantallas estrechas o cuando el marco ocupa toda la ventana se activa la pantalla completa, donde el simulador llena la pantalla y el manual pasa a un cajón redimensionable con un icono de libro en el borde para abrirlo y reposicionarlo.`)
};

const en_xa2_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàd ànd Sìmùlàtè àrè tògglèd fròm thè tòp bàr. Rèàd mòdè shòws thè hàndbòòk às à dòcùmènt wìth thè sìmùlàtòr hìddèn bùt stìll rùnnìng. Sìmùlàtè mòdè shòws thè phònè fràmè àlòngsìdè thè tèxt òn wìdè scrèèns, ànd òn nàrròw scrèèns òr whèn thè fràmè fìlls thè wìndòw ìt àctìvàtès fùllscrèèn, whèrè thè sìmùlàtòr fìlls thè scrèèn ànd thè hàndbòòk mòvès ìntò à rèsìzàblè dràwèr wìth à bòòk ìcòn tàb òn thè èdgè tò òpèn ànd rèpòsìtìòn ìt. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Read and Simulate are toggled from the top bar. Read mode shows the handbook as a document with the simulator hidden but still running. Simulate mode shows t..." |
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