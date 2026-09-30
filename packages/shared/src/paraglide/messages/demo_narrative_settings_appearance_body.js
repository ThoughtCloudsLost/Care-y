/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Appearance_BodyInputs */

const en_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The color scheme can be dark, light, or follow the device. The choice is stored in the browser's local storage on that device and never sent to the server. A browser with no stored preference starts dark. [[#client-data #privacy]]
**What does "follow the device" store?** The browser keeps the word "system" rather than the scheme it resolved to. When the device's own setting changes, the app re-resolves without a new choice from the user. [[#client-data]]
**Interface language.** The interface language is stored on the account, not in the browser, so it travels with the user across devices. A color scheme belongs to the single browser that chose it. [Language selection](#settings/language) covers what the server holds of that choice. [[#encryption #server-holds]]
**Platform styling.** The iOS or Material styling is detected from the browser's user agent on every load. No request goes to the server. No setting exists to change it. [On the device](#deep-dive/on-the-device) covers the full set of values each page leaves in browser storage. [[#client-data]]
**The theme store and scheme toggle.** \`packages/client/src/lib/stores/theme.svelte.ts\` holds the color scheme under \`care-y-color-scheme\` in local storage. \`toggleSchemeWithPalette\` in \`packages/client/src/lib/branding/scheme-toggle.ts\` flips the scheme and re-derives the palette from the organization's brand colors for the new scheme. [[#client-data]]`)
};

const es_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El esquema de color puede ser oscuro, claro o seguir al dispositivo. La elección se guarda en el almacenamiento local del navegador de ese dispositivo y no se envía al servidor. Un navegador sin preferencia almacenada arranca en oscuro. [[#client-data #privacy]]
**¿Qué almacena "seguir al dispositivo"?** El navegador guarda la palabra "system" en lugar del esquema al que se resolvió. Cuando el ajuste del propio dispositivo cambia, la aplicación lo resuelve de nuevo sin necesidad de una nueva elección. [[#client-data]]
**Idioma de la interfaz.** El idioma de la interfaz se guarda en la cuenta, no en el navegador, de modo que acompaña a la persona usuaria a otros dispositivos. Un esquema de color pertenece al navegador que lo eligió. [Selección de idioma](#settings/language) trata lo que el servidor guarda de esa elección. [[#encryption #server-holds]]
**Estilo de plataforma.** El estilo iOS o Material se detecta a partir del agente de usuario del navegador en cada carga. No se envía ninguna petición al servidor. No existe ningún ajuste para cambiarlo. [En el dispositivo](#deep-dive/on-the-device) trata el conjunto completo de valores que cada página deja en el almacenamiento del navegador. [[#client-data]]
**El almacén de tema y la alternancia de esquema.** \`packages/client/src/lib/stores/theme.svelte.ts\` guarda el esquema de color bajo \`care-y-color-scheme\` en el almacenamiento local. \`toggleSchemeWithPalette\` en \`packages/client/src/lib/branding/scheme-toggle.ts\` alterna el esquema y vuelve a derivar la paleta a partir de los colores de marca de la organización para el nuevo esquema. [[#client-data]]`)
};

const en_xa2_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còlòr schèmè càn bè dàrk, lìght, òr fòllòw thè dèvìcè. Thè chòìcè ìs stòrèd ìn thè bròwsèr's lòcàl stòràgè òn thàt dèvìcè ànd nèvèr sènt tò thè sèrvèr. À bròwsèr wìth nò stòrèd prèfèrèncè stàrts dàrk. [[#clìènt-dàtà #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès "fòllòw thè dèvìcè" stòrè? •••••••••••** Thè bròwsèr kèèps thè wòrd "systèm" ràthèr thàn thè schèmè ìt rèsòlvèd tò. Whèn thè dèvìcè's òwn sèttìng chàngès, thè àpp rè-rèsòlvès wìthòùt à nèw chòìcè fròm thè ùsèr. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìntèrfàcè làngùàgè. ••••••** Thè ìntèrfàcè làngùàgè ìs stòrèd òn thè àccòùnt, nòt ìn thè bròwsèr, sò ìt tràvèls wìth thè ùsèr àcròss dèvìcès. À còlòr schèmè bèlòngs tò thè sìnglè bròwsèr thàt chòsè ìt. [Làngùàgè sèlèctìòn](#sèttìngs/làngùàgè) còvèrs whàt thè sèrvèr hòlds òf thàt chòìcè. [[#èncryptìòn #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Plàtfòrm stylìng. ••••••** Thè ìÒS òr Màtèrìàl stylìng ìs dètèctèd fròm thè bròwsèr's ùsèr àgènt òn èvèry lòàd. Nò rèqùèst gòès tò thè sèrvèr. Nò sèttìng èxìsts tò chàngè ìt. [Òn thè dèvìcè](#dèèp-dìvè/òn-thè-dèvìcè) còvèrs thè fùll sèt òf vàlùès èàch pàgè lèàvès ìn bròwsèr stòràgè. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè thèmè stòrè ànd schèmè tògglè. •••••••••••** \`pàckàgès/clìènt/src/lìb/stòrès/thèmè.svèltè.ts\` hòlds thè còlòr schèmè ùndèr \`càrè-y-còlòr-schèmè\` ìn lòcàl stòràgè. \`tògglèSchèmèWìthPàlèttè\` ìn \`pàckàgès/clìènt/src/lìb/bràndìng/schèmè-tògglè.ts\` flìps thè schèmè ànd rè-dèrìvès thè pàlèttè fròm thè òrgànìzàtìòn's brànd còlòrs fòr thè nèw schèmè. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The color scheme can be dark, light, or follow the device. The choice is stored in the browser's local storage on that device and never sent to the server. A..." |
*
* @param {Demo_Narrative_Settings_Appearance_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_appearance_body = /** @type {((inputs?: Demo_Narrative_Settings_Appearance_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Appearance_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_appearance_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_appearance_body(inputs)
	return en_demo_narrative_settings_appearance_body(inputs)
});